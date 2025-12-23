import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { NoTransformResponse } from './common/decorator/notransform';
import { Public } from './common/decorator/public';
import { SemApiService } from './sem-api.service';

import { REQUEST } from '@nestjs/core';
import { RedisLockService } from './modules/redisLock/redisLock.service';

@Controller('/')
export class SemApiController {
  private readonly logger = new Logger(SemApiController.name);
  constructor(
    private readonly semApiService: SemApiService,
    private readonly redisLockService: RedisLockService
  ) {
    console.log('SemApiController init');
  }

  @Post('/getSchema')
  @Public()
  @NoTransformResponse()
  getHello() {
    return 'Hello World!';
  }
  @Public()
  @Get('/test')
  test(@Body() body, @Req() req) {
    // let a;
    this.logger.log('message', 'aaa');
    // console.log(req.app.get('SemApiService'));
    this.redisLockService.lockOnce('test', 6000);
    return this.semApiService.getHello();
    // return body;
  }
}
