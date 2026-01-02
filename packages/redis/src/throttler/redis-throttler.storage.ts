import { Injectable, Logger } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { RedisClientService } from '../client/redis-client.service';

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
    private readonly prefix = '_throttler';
    private readonly logger = new Logger(RedisThrottlerStorage.name);
    private readonly script = `
      local key = KEYS[1]
      local blockKey = KEYS[2]
      local throttlerName = ARGV[1]
      local ttlMs = tonumber(ARGV[2])
      local limit = tonumber(ARGV[3])
      local blockDurationMs = tonumber(ARGV[4])

      -- 1. Check if already blocked
      if redis.call("EXISTS", blockKey) == 1 then
        return { limit + 1, -1, redis.call("PTTL", blockKey), 1 }
      end

      -- 2. If not blocked: Increment hit count for this throttler
      local hits = redis.call("HINCRBY", key, throttlerName, 1)

      -- 3. If new key: set TTL (only if ttlMs > 0)
      if redis.call("PTTL", key) <= 0 and ttlMs > 0 then
        redis.call("PEXPIRE", key, ttlMs)
      end

      -- 4. If under limit: return normal response
      if hits <= limit then
        return { hits, redis.call("PTTL", key), -1, 0 }
      end

      -- 5. If over limit: set block flag (only if blockDurationMs > 0)
      if blockDurationMs > 0 then
        redis.call("SET", blockKey, "1", "PX", blockDurationMs)
        return { hits, redis.call("PTTL", key), blockDurationMs, 1 }
      else
        return { hits, redis.call("PTTL", key), -1, 0 }
      end
    `;

    constructor(private readonly redisService: RedisClientService) {}

    async increment(
        key: string,
        ttl: number,
        limit: number,
        blockDuration: number,
        throttlerName: string
    ): Promise<any> {
        const client = await this.redisService.getClient();
        const ttlMilliseconds = ttl;
        const blockDurationMilliseconds = blockDuration;

        const redisKey = `${this.prefix}:{${key}}`;
        const blockKey = `${redisKey}:block:${throttlerName}`;

        try {
            // Support for node-redis v4 structure
            // client.eval(script, { keys: [], arguments: [] })
            const [totalHits, timeToExpireMs, timeToBlockExpireMs, isBlocked] =
                (await client.eval(this.script, {
                    keys: [redisKey, blockKey],
                    arguments: [
                        throttlerName,
                        ttlMilliseconds.toString(),
                        limit.toString(),
                        blockDurationMilliseconds.toString(),
                    ],
                })) as [number, number, number, number];

            return {
                totalHits,
                timeToExpire:
                    timeToExpireMs > 0 ? Math.ceil(timeToExpireMs / 1000) : 0,
                isBlocked: isBlocked === 1,
                timeToBlock:
                    timeToBlockExpireMs > 0
                        ? Math.ceil(timeToBlockExpireMs / 1000)
                        : 0,
            };
        } catch (error) {
            this.logger.error(
                `Redis throttle error: ${error.message}`,
                error.stack
            );
            // Fallback to allow if redis fails? Or block?
            // Throwing error usually means "Internal Server Error" for the user, which is safe but annoying.
            // Returning a safe 'allow' record might be better if redis is down?
            // But strict rate limiting prefers fail-closed or fail-open depending on policy.
            // Let's rethrow for now to make it visible.
            throw error;
        }
    }
}
