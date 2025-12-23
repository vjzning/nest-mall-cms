import { Injectable } from "@nestjs/common";
import { randomUUID } from 'node:crypto';

import { RedisClientService } from "../redisClient/redisClient.service";


@Injectable()
export class RedisLockService {
  public readonly uuid: string = randomUUID();
  constructor(
    private readonly redisClientService: RedisClientService,
  ) {
  }



  private prefix(name): string {
    return `lock:${name}`;
  }

  private async getClient() {
    return await this.redisClientService.getClient();
  }



  /**
   * Try to lock once
   * @param {string} name lock name
   * @param {number} [expire] milliseconds, TTL for the redis key
   * @returns {boolean} true: success, false: failed
   */
  public async lockOnce(name, expire) {
    const client = await this.getClient();
    const result = await client.set(
      this.prefix(name),
      this.uuid,
      {
        PX: expire,
        NX: true,
      },
    );
    return result !== null;
  }

  /**
   * Get a lock, automatically retrying if failed
   * @param {string} name lock name
   * @param {string} [expire] expire time
   * @param {number} [retryInterval] milliseconds, the interval to retry if failed
   * @param {number} [maxRetryTimes] max times to retry
   */
  public async lock(
    name: string,
    expire: number = 60000,
    retryInterval: number = 100,
    maxRetryTimes: number = 600
  ): Promise<void> {
    let retryTimes = 0;
    while (true) {
      if (await this.lockOnce(name, expire)) {
        break;
      } else {
        await this.sleep(retryInterval);
        if (retryTimes >= maxRetryTimes) {
          throw new Error(`RedisLockService: locking ${name} timed out`);
        }
        retryTimes++;
      }
    }
  }

  /**
   * Unlock a lock by name
   * @param {string} name lock name
   */
  public async unlock(name) {
    const client = await this.getClient();
    const result = await client.eval(
      "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
      {
        keys: [this.prefix(name)],
        arguments: [this.uuid],
      },
    );
  }

  /**
   * Set TTL for a lock
   * @param {string} name lock name
   * @param {number} milliseconds TTL
   */
  public async setTTL(name, milliseconds) {
    const client = await this.getClient();
    const result = await client.pExpire(this.prefix(name), milliseconds);
  }

  /**
   * @param {number} ms milliseconds, the sleep interval
   */
  public sleep(ms: Number): Promise<Function> {
    return new Promise((resolve) => setTimeout(resolve, Number(ms)));
  }
}