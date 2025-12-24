import { Module } from "@nestjs/common";
import { RedisLockService } from "./redisLock.service";
import { RedisClientModule } from "../redisClient/redisClient.module";

@Module({
  imports: [RedisClientModule],
  providers: [RedisLockService],
  exports: [RedisLockService],
})
export class RedisLockModule {

}