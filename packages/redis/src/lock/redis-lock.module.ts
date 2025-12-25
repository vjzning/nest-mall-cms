import { Module } from "@nestjs/common";
import { RedisLockService } from "./redis-lock.service";
import { RedisClientModule } from "../client/redis-client.module";

@Module({
  imports: [RedisClientModule],
  providers: [RedisLockService],
  exports: [RedisLockService],
})
export class RedisLockModule {

}
