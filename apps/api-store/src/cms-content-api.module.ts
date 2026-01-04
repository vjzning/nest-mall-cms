import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CmsContentApiController } from './cms-content-api.controller';
import { CmsContentApiService } from './cms-content-api.service';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { TagModule } from './tag/tag.module';
import { CommentModule } from './comment/comment.module';
import { MallModule } from './mall/mall.module';
import { AuthModule } from './auth/auth.module';
import { MemberModule } from './member/member.module';
import { SearchModule } from './search/search.module';
import { SystemConfigModule } from '@app/shared/system-config/system-config.module';
import databaseConfig from './config/database.config';
import { RedisClientModule, RedisLockModule } from '@app/redis';
import { QueueModule } from '@app/queue';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv as createKeyvRedis } from '@keyv/redis';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisThrottlerStorage, RedisClientService } from '@app/redis';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerBehindProxyGuard } from '@app/shared/guards/throttler-behind-proxy.guard';

@Module({
    imports: [
        ThrottlerModule.forRootAsync({
            imports: [RedisClientModule], // 确保能注入 RedisClientService
            inject: [RedisClientService],
            useFactory: (redis: RedisClientService) => ({
                throttlers: [
                    {
                        // 全局默认限流规则：例如 60秒内最多 100 次请求
                        name: 'default',
                        ttl: 60000,
                        limit: 100,
                    },
                ],
                // 挂载我们自定义的 Redis 存储
                storage: new RedisThrottlerStorage(redis),
            }),
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                ...configService.get('database'),
                autoLoadEntities: true,
            }),
            inject: [ConfigService],
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: (configService: ConfigService) => {
                const redisHost =
                    configService.get('REDIS_HOST') ?? '127.0.0.1';
                const redisPort = configService.get('REDIS_PORT') ?? 6379;
                const redisPassword = configService.get('REDIS_PASSWORD');
                const redisDb = configService.get('REDIS_DB') ?? 1;
                // redis[s]://[[username][:password]@][host][:port][/db-number]
                const store = createKeyvRedis({
                    password: redisPassword,
                    database: redisDb,
                    url: `redis://${redisHost}:${redisPort}`,
                });
                return {
                    stores: [store],
                };
            },
            inject: [ConfigService],
        }),
        RedisClientModule,
        RedisLockModule,
        QueueModule,
        ArticleModule,
        CategoryModule,
        TagModule,
        CommentModule,
        MallModule,
        AuthModule,
        MemberModule,
        SearchModule,
        SystemConfigModule,
    ],
    controllers: [CmsContentApiController],
    providers: [
        CmsContentApiService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerBehindProxyGuard,
        },
    ],
})
export class CmsContentApiModule {}
