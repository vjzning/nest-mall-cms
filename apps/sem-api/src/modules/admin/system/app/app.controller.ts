/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Query } from '@nestjs/common';
import { Public } from 'apps/sem-api/src/common/decorator/public';
import { AppService } from './app.service';
import { CreateAppDto, PushMqQueryDto } from './dto';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { ActivityService } from '../activity/activity.service';
import { HttpService } from '@nestjs/axios';

@Controller('/app')
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    public service: ActivityService,
  ) { }
  @Get('/list')
  @Public()
  getAppList() {
    return this.appService.getAppList();
  }
  @Post('/add')
  @Public()
  createApp(@Query() qs: CreateAppDto) {
    return this.appService.createApp(qs.name);
  }
  @Get('/push/mq')
  @Public()
  async pushMq(@Query() qs: PushMqQueryDto) {
    const id = qs.id;
    const info = await this.service.getInfo(id)
    const api = this.configService.get('MarketingApi');
    const reuslt = await this.httpService.post(`${api}/activity/indicators/pushMq`, info).toPromise();
    console.log(reuslt.status, reuslt.data);
    return reuslt.data;
  }
}
