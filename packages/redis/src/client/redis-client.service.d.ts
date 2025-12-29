import type { Cache } from 'cache-manager';
import type { RedisClientConnectionType } from '@keyv/redis';
export declare class RedisClientService {
    private readonly cacheManager;
    constructor(cacheManager: Cache);
    getClient(): Promise<RedisClientConnectionType>;
}
