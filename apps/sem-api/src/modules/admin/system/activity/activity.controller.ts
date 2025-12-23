import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OperationLogDecorator } from 'apps/sem-api/src/common/decorator/operation';
import { Public } from 'apps/sem-api/src/common/decorator/public';
import { User } from 'apps/sem-api/src/common/decorator/usesr.decorator';
import { TableListParams } from 'apps/sem-api/src/common/dto/index';
import { UserEntity } from 'apps/sem-api/src/entity/user.entity';
import * as fs from 'fs';
import { QueryId, UpdateStatus } from '../account/dto';
import { ActivityService } from './activity.service';
import { ActivityTaskDto, CreateActivityDto, RunDayTaskQueryDto } from './dto';
import * as Yaml from 'js-yaml';
import { spawn } from 'child_process';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import winston = require('winston');
import { DeployStatus } from 'apps/sem-api/src/common/enum';
import dayjs = require('dayjs');
import { MyHttpException } from 'apps/sem-api/src/common/exception/my.http.exception';
import { ErrorCode } from 'apps/sem-api/src/common/constants/error';

import { Brackets, DataSource, IsNull, MoreThan, Not } from 'typeorm';
import { ActivityEntity } from 'apps/sem-api/src/entity/activities.entity';
import { Utils } from 'apps/sem-api/src/common/utils/utils';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';
import * as moment from 'moment';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Controller('activity')
export class ActivityController {
  private readonly logger = new Logger(ActivityController.name);
  constructor(
    public service: ActivityService,
    private readonly configService: ConfigService,
    private readonly utils: Utils,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
    private dataSource: DataSource
  ) { }

  @Post('/add')

  @OperationLogDecorator(['活动', '添加/修改'])
  async createActivity(
    @Body() dto: CreateActivityDto,
    @User() user: UserEntity
  ) {
    dto.user = user;
    if (dto.id) {
      const actInfo = await this.service.getActivityById(dto.id);
      if (actInfo.deployInfo == 'locked') {
        return dto;
        // return '活动已锁定，无法修改';
      }
    }
    const ret = await this.service.createActivity(dto);
    if (dto['opAction'] == 'copy') {
      await this.service.syncActivityRankingIdToParams(ret.id);
    }
    ret.deployStatus == DeployStatus.Success &&
      this.service.getActivityInfo(ret.id + '').then(async (actInfo) => {
        this.utils.setActInfoCache(actInfo);
      });
    return ret;
  }

  @Get('/deploy')
  async deployActivity(@Query() qs: QueryId) {
    // 改造成锁定配置
    this.service.update({
      id: +qs.id,
      deployInfo: 'locked',
    });
    return;
  }

  @Get('/unlock')
  async unlockActivity(@Query() qs: QueryId) {
    // 改造成解锁配置
    this.service.update({
      id: +qs.id,
      deployInfo: 'unlocked',
    });
    return;
  }
  @Get('refresh')
  @Public()
  async refreshActCache(@Query() qs: QueryId) {
    const info = await this.service.getActivityInfo(qs.id as string);
    if (info && info.uniqueCode) {
      this.utils.setActInfoCache(info);
    }
    return;
  }
  @Get('/get')

  async getActivityList(@Query() qs: TableListParams) {
    return this.service.getList(qs);
  }
  @Get('/info')
  @Public()


  async getActivityInfo(@Query('id') id) {
    const info = await this.service.getActivityInfo(id);
    return info;
  }
  @Delete('/delete')

  @OperationLogDecorator(['活动', '删除'])
  async deleteActivity(@Body() body: QueryId) {
    const ret = this.service.deleteActivity(body.id);
    await this.refreshActCache({ id: +body.id });
    return ret;
  }
  @Patch('/update/status')

  @OperationLogDecorator(['活动', '上线/下线'])
  async updateStatus(@Body() body: UpdateStatus) {
    await this.service.updateStatus(body);
    await this.refreshActCache({ id: +body.id });
  }
  @Public()
  @Get('/check/code')

  async hasCode(@Query('key') key) {
    const findRet = await this.dataSource.getRepository(ActivityEntity).findOne({
      where: {
        uniqueCode: key,
      },
    });
    return !!findRet;
  }
  @Get('/options')
  @Public()
  async getSelectOptions() {
    return await this.dataSource
      .getRepository(ActivityEntity)
      .createQueryBuilder('activity')
      .select('activity.id', 'value')
      .addSelect('activity.unique_code', 'unique_code')
      .addSelect(
        "CONCAT(activity.id, ':', activity.name,'(', activity.unique_code, ')')",
        'label'
      )
      .where({
        isDel: false,
        uniqueCode: Not(IsNull()),
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where({
            end_time: MoreThan(new Date()),
          }).orWhere({
            create_at: MoreThan(
              moment().add(-3, 'month').format('YYYY-MM-DD HH:mm:ss')
            ),
          });
        })
      )
      .orderBy('activity.id', 'DESC')
      .getRawMany();
  }
  @Get('/jobs')
  @Public()

  async getJobInfo(@Query('id') id) {
    const jobId = 'act:' + id;
    return this.service.getJobInfo(jobId);
  }
  //手动触发每日任务
  @Get('/run/task')
  async runDayTask(@Query() qs: RunDayTaskQueryDto) {
    const { actCode, taskId, runTime } = qs;
    const end = moment().add(100, 'day').format('x');
    const start = moment().add(-100, 'day').format('x');
    if (runTime > end || runTime < start) {
      throw new MyHttpException({
        message: 'runTime 时间戳范围 跨度为前后100天',
      });
    }
    if (actCode && runTime) {
      const actInfo = await this.service.getInfo(actCode);
      let newTask = [];
      if (taskId) {
        newTask = actInfo.tasks.filter((i) => i.id == +taskId);
      } else {
        newTask = actInfo.tasks;
      }
      actInfo['runTime'] = +runTime;
      for (const task of newTask) {
        task.runTime = +runTime;
        task.activity = {
          id: actInfo.id,
          uniqueCode: actInfo.uniqueCode,
        };
        await this.service.getCompleteAndInster(task, actInfo);
      }
    } else {
      throw new MyHttpException({
        message: '参数错误',
      });
    }
  }
  @Public()
  @Get('/sync/act/rank/params')

  async syncActRankToParams(@Query('id') id) {
    await this.service.syncActivityRankingIdToParams(id);
  }
  @Post('/task/create')

  async createActivityTask(@Body() body: ActivityTaskDto) {
    // console.log(body);
    if (body['activity']) {
      const actInfo = await this.service.getActivityById(body['activity']);
      if (actInfo?.deployInfo == 'locked') {
        console.log('活动已锁定，无法修改');
        return;
      }
    }
    return this.service.saveActivityTask(body);
  }
  @Public()
  @Get('/test')
  async test() {
    this.service.handleCronByDay();
    // return { message: 'Daily task triggered' };
  }
}
