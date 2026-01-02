import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import type KeyvRedis from '@keyv/redis';
import type { RedisClientConnectionType } from '@keyv/redis';
import { Keyv } from 'keyv';

@Injectable()
export class RedisClientService {
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache
    ) {}

    async getClient(): Promise<RedisClientConnectionType> {
        const stores = (this.cacheManager as any)?.stores;
        // Check if stores is an array (multi-store) or single store
        let keyv: Keyv;

        if (Array.isArray(stores)) {
            keyv = stores[0];
        } else {
            // Fallback for single store configuration
            keyv = (this.cacheManager as any)?.store;

            // If it's a direct store object (not wrapped in Keyv sometimes depending on version/config)
            // But with @nestjs/cache-manager v2/v3 + keyv adapter, it's usually consistent.
            // Let's stick to the logic from sem-api but be safer.
        }

        if (!keyv) {
            // Try one more way to get the store if the structure is different
            // This is a bit of a hack because cache-manager internals vary
            keyv = this.cacheManager as any;
        }

        // console.log(keyv.store);
        if (!keyv) {
            throw new Error(
                'RedisClientService: cache store does not support getClient(). Ensure CacheModule is configured with KeyvRedis.'
            );
        }

        // In recent versions, we need to access the underlying store
        const redisStore = keyv.store as unknown as KeyvRedis<any>;

        if (!redisStore || typeof redisStore.getClient !== 'function') {
            // Maybe it's directly the redis store?
            if (typeof (keyv as any).getClient === 'function') {
                return await (keyv as any).getClient();
            }

            throw new Error(
                'RedisClientService: Could not find getClient() method on cache store.'
            );
        }

        return await redisStore.getClient();
    }
}
