import { Test, TestingModule } from '@nestjs/testing';
import { RedisLockService } from './redisLock.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import * as Joi from 'joi';
import { RedisClientService } from '../redisClient/redisClient.service';

describe('RedisLockService (Real Redis)', () => {
  let service: RedisLockService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env'],
          validationSchema: Joi.object({
            REDIS_HOST: Joi.string().default('localhost'),
            REDIS_PORT: Joi.number().default(6379),
            REDIS_DB: Joi.number().default(1),
          }),
        }),
      ],
      providers: [
        RedisLockService,
        {
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            const host = configService.get<string>('REDIS_HOST');
            const port = configService.get<string>('REDIS_PORT');
            const db = configService.get<number>('REDIS_DB');

            const keyvStore = new KeyvRedis(`redis://${host}:${port}/${db}`);
            const client = keyvStore['_client'];
            // Explicitly connect the client for testing since we bypass Keyv
            if (!client.isOpen) {
              await client.connect();
            }
            return {
              getClient: async () => await keyvStore.getClient(),
            };
          },
          provide: RedisClientService,
        },
      ],
    }).compile();

    service = module.get<RedisLockService>(RedisLockService);
  });

  afterEach(async () => {
    // Close redis connection to prevent hanging tests
    try {
      const client = (await service['getClient']()) as any;
      if (client && client.isOpen) {
        await client.quit();
      }
    } catch (e) {
      console.error('Error closing redis client:', e);
    }
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const testKey = 'test-lock-key-' + Date.now();

  describe('lockOnce', () => {
    it('should return true when lock is acquired successfully', async () => {
      // Ensure key is clear
      await service.unlock(testKey);

      const result = await service.lockOnce(testKey, 5000);
      expect(result).toBe(true);

      // Attempt to lock again should fail
      const result2 = await service.lockOnce(testKey, 5000);
      expect(result2).toBe(false);

      await service.unlock(testKey);
    });
  });

  describe('lock', () => {
    it('should acquire lock successfully', async () => {
      await service.unlock(testKey);
      await expect(service.lock(testKey)).resolves.not.toThrow();
      await service.unlock(testKey);
    });

    it('should wait and acquire lock', async () => {
      const key = testKey + '-wait';
      await service.unlock(key);

      // First lock
      await service.lockOnce(key, 2000);

      // Start trying to lock (should wait)
      const start = Date.now();
      await service.lock(key, 5000, 100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(1800); // Allow some buffer

      await service.unlock(key);
    }, 10000); // incr timeout
  });

  describe('unlock', () => {
    it('should unlock successfully', async () => {
      await service.lockOnce(testKey, 5000);
      await service.unlock(testKey);

      // Should be able to lock again
      const result = await service.lockOnce(testKey, 5000);
      expect(result).toBe(true);
      await service.unlock(testKey);
    });
  });

  describe('setTTL', () => {
    it('should set TTL successfully', async () => {
      await service.lockOnce(testKey, 10000); // 10s
      await service.setTTL(testKey, 1000); // change to 1s

      // Wait 1.5s, should be expired
      await new Promise(r => setTimeout(r, 1500));

      // Should be available now
      const result = await service.lockOnce(testKey, 5000);
      expect(result).toBe(true);

      await service.unlock(testKey);
    });
  });
});
