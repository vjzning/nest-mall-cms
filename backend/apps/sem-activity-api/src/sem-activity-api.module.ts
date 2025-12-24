import { Module } from '@nestjs/common';
import { SemActivityApiController } from './sem-activity-api.controller';
import { SemActivityApiService } from './sem-activity-api.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root123456',
      database: 'test_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UserModule,
    PostModule,
  ],
  controllers: [SemActivityApiController],
  providers: [SemActivityApiService],
})
export class SemActivityApiModule {}
