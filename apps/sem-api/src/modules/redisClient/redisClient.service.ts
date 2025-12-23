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
    const keyv: Keyv = Array.isArray(stores) ? stores[0] : undefined;

    // console.log(keyv.store);
    if (!keyv) {
      throw new Error(
        'RedisClientService: cache store does not support getClient(). Ensure CacheModule is configured with KeyvRedis.'
      );
    }
    const reids: KeyvRedis<RedisClientConnectionType> = keyv.store
    return await reids.getClient();
  }
}
