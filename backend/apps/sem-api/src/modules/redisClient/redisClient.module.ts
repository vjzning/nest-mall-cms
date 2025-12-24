import { Module } from '@nestjs/common';
import { RedisClientService } from './redisClient.service';

@Module({
  providers: [RedisClientService],
  exports: [RedisClientService],
})
export class RedisClientModule {}
