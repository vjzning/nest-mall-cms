import { RedisClientService } from "../client/redis-client.service";
export declare class RedisLockService {
    private readonly redisClientService;
    readonly uuid: string;
    constructor(redisClientService: RedisClientService);
    private prefix;
    private getClient;
    lockOnce(name: any, expire: any): Promise<boolean>;
    lock(name: string, expire?: number, retryInterval?: number, maxRetryTimes?: number): Promise<void>;
    unlock(name: any): Promise<void>;
    setTTL(name: any, milliseconds: any): Promise<void>;
    sleep(ms: Number): Promise<Function>;
}
