import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
const dev = process.env.NODE_ENV !== 'production';
import { MyHttpExceptionFilter } from './common/filter/exception';
import { MyAuthGuard } from './common/guards/auth.guards';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { CoreModule } from './common/modules/CoreModule';
import { AuthModule } from './modules/auth/auth.module';
import { SemApiController } from './sem-api.controller';
import { SemApiService } from './sem-api.service';
import { ScheduleModule } from '@nestjs/schedule';
import { RoleGuard } from './common/guards/role.guard';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configServie: ConfigService) => {
        const config = configServie.get('database');
        const dbLog = configServie.get('showDBLog');
        if (dev && dbLog) {
          config.logging = true;
        }
        if (dev) {
          config.synchronize = !!configServie.get('synchronize');
        }
        config.cache.options = {
          host: configServie.get('REDIS_HOST'),
          port: configServie.get('REDIS_PORT'),
          db: configServie.get('REDIS_DB') || 1,
        };
        return config;
      },
      inject: [ConfigService],
    }),
    MulterModule.register(),
    CoreModule,
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [SemApiController],
  providers: [
    SemApiService,
    {
      provide: APP_FILTER,
      useClass: MyHttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: MyAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class SemApiModule implements OnApplicationBootstrap {
  onApplicationBootstrap() {
    // console.log('SemApiModule onApplicationBootstrap...');
  }
}
