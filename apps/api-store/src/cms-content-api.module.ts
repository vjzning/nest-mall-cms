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
import { SystemConfigModule } from '@app/shared/system-config/system-config.module';
import databaseConfig from './config/database.config';
import { RedisClientModule, RedisLockModule } from '@app/redis';
import { QueueModule } from '@app/queue';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv as createKeyvRedis } from '@keyv/redis';

@Module({
    imports: [
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
                    configService.get('redis.host') ?? '127.0.0.1';
                const redisPort = configService.get('redis.port') ?? 6379;
                const redisPassword = configService.get('redis.password');
                const redisDb = configService.get('redis.db') ?? 1;
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
        SystemConfigModule,
    ],
    controllers: [CmsContentApiController],
    providers: [CmsContentApiService],
})
export class CmsContentApiModule {}
