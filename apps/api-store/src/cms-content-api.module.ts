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
import databaseConfig from './config/database.config';

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
    ArticleModule,
    CategoryModule,
    TagModule,
    CommentModule,
    MallModule,
    AuthModule,
  ],
  controllers: [CmsContentApiController],
  providers: [CmsContentApiService],
})
export class CmsContentApiModule { }
