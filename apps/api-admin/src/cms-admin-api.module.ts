import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientModule, RedisLockModule } from '@app/redis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { CmsAdminApiController } from './cms-admin-api.controller';
import { CmsAdminApiService } from './cms-admin-api.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { MenuModule } from './menu/menu.module';
import { PermissionsGuard } from './auth/permissions.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CategoryModule } from './category/category.module';
import { ArticleModule } from './article/article.module';
import { TagModule } from './tag/tag.module';
import { CommentModule } from './comment/comment.module';
import { UploadModule } from './upload/upload.module';
import { DictionaryModule } from './dictionary/dictionary.module';
import { ResourceModule } from './resource/resource.module';
import { SystemConfigModule } from './system-config/system-config.module';
import { MallModule } from './mall/mall.module';
import databaseConfig from './config/database.config';
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
        const redisHost = configService.get('redis.host') ?? '127.0.0.1'
        const redisPort = configService.get('redis.port') ?? 6379
        const redisPassword = configService.get('redis.password')
        const redisDb = configService.get('redis.db') ?? 1
        // redis[s]://[[username][:password]@][host][:port][/db-number]
        const store = createKeyvRedis({
          password: redisPassword,
          database: redisDb,
          url: `redis://${redisHost}:${redisPort}`,
        })
        return {
          stores: [store],
        }
      },
      inject: [ConfigService],
    }),
    RedisClientModule,
    RedisLockModule,
    AuthModule,
    UserModule,
    RoleModule,
    MenuModule,
    CategoryModule,
    ArticleModule,
    TagModule,
    CommentModule,
    UploadModule,
    DictionaryModule,
    ResourceModule,
    SystemConfigModule,
    MallModule,
  ],
  controllers: [CmsAdminApiController],
  providers: [
    CmsAdminApiService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class CmsAdminApiModule { }
