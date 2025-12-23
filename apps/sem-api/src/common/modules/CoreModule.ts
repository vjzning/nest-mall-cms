import * as Joi from 'joi';
import { BullModule } from '@nestjs/bullmq';
import {
  Global,
  Module,
  OnModuleInit,
} from '@nestjs/common';
// import { QueueModule } from 'src/queue/queue.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import commonConfig from '../../config/common.config';
import dbConfig from '../../config/db.config';
import { Utils } from '../utils/utils';
import { CacheModule } from '@nestjs/cache-manager';

import KeyvRedis from '@keyv/redis';
import { HttpModule } from '@nestjs/axios';
import { RedisLockModule } from '@app/sem-api/modules/redisLock/redisLock.module';
import { RedisClientModule } from '@app/sem-api/modules/redisClient/redisClient.module';

@Global()
@Module({
  imports: [
    RedisClientModule,
    RedisLockModule,
    HttpModule.register({
      timeout: 33000,
      maxRedirects: 10,
    }),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      name: 'activity',
      useFactory: async (configService: ConfigService) => {
        return {
          defaultJobOptions: {
            removeOnComplete: {
              age: 7 * 24 * 60 * 60,
            },
            removeOnFail: {
              age: 7 * 24 * 60 * 60,
            },
          },
          connection: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
            db: configService.get('REDIS_DB') || 1,
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(9000),
      }),
      expandVariables: true,
      load: [dbConfig, commonConfig],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST');
        const port = configService.get<string>('REDIS_PORT');
        const db = configService.get<number>('REDIS_DB') || 1;
        return {
          ttl: configService.get('REDIS_TTL'),
          stores: [
            new KeyvRedis(`redis://${host}:${port}/${db}`)
          ],
        }
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [Utils],
  exports: [
    HttpModule,
    Utils,
    CacheModule,
    BullModule,
    RedisClientModule,
    RedisLockModule,
  ],
})
export class CoreModule { }
