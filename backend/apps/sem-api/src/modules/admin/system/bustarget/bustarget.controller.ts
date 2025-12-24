import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from 'apps/sem-api/src/common/decorator/public';
import { BusTargetService } from './bustarget.service';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { BaseTableListParams } from 'apps/sem-api/src/common/dto/index';
import * as fs from 'fs';
import { SaveBusTargetDto } from './dto';
import { QueryId, UpdateStatus } from '../account/dto';
import { OperationLogDecorator } from 'apps/sem-api/src/common/decorator/operation';
import { RedisLockService } from '@app/sem-api/modules/redisLock/redisLock.service';
import { DataSource, IsNull, Not } from 'typeorm';
import { TaskConditionEntity } from 'apps/sem-api/src/entity/task.condition.entity';
import { Utils } from 'apps/sem-api/src/common/utils/utils';
import { MyHttpException } from 'apps/sem-api/src/common/exception/my.http.exception';

import { FunctionsTarget } from 'apps/sem-api/src/common/utils/function_target';
import functionMeta from '../../../../common/utils/function.meta';
import _ from 'lodash';

@Controller('bustarget')
export class BusTargetController {
  private serverlessPath;
  constructor(
    private readonly bustargetService: BusTargetService,
    protected readonly lockService: RedisLockService,
    private readonly utils: Utils,
    private readonly functionsTarget: FunctionsTarget,
    private dataSource: DataSource
  ) {
    const serverlessPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'node_modules/serverless/scripts/serverless.js'
    );
    this.serverlessPath = serverlessPath;
  }
  @Get('/options')
  @Public()
  async getOptions() {
    return this.bustargetService.getOptions();
  }
  @Get('/list')

  async getList(@Query() dto: BaseTableListParams) {
    dto['isDel'] = true;
    return this.bustargetService.getList(dto);
  }
  @Post('/save')

  @OperationLogDecorator(['指标', '更新'])
  async save(@Body() dto: SaveBusTargetDto) {
    const entity = await this.bustargetService.save(dto);
    return entity;
  }
  @Post('/update/status')

  @OperationLogDecorator(['指标', '更新状态'])
  async updateStatus(@Body() dto: UpdateStatus) {
    return this.bustargetService.save(dto);
  }
  @Delete('/delete')

  @OperationLogDecorator(['指标', '删除'])
  async delete(@Body() body: QueryId) {
    const id = body.id;
    const repo = this.dataSource.getRepository(TaskConditionEntity);
    const conditons = await repo.find({
      where: {
        instanceTask: Not(IsNull()),
      },
    });
    for (const v of conditons) {
      const str = this.utils.parseCondition(v.conditions, '');
      if (str.includes(`key_id_${id}`)) {
        //指标已被引用
        throw new MyHttpException({
          message: '被引用的指标无法删除',
        });
      }
    }
    // return;
    const entity = await this.bustargetService.remove(id);
    // if (entity.baseDir) {
    //   spawn('node', [this.serverlessPath, 'remove'], { cwd: entity.baseDir });
    // }
    return entity;
  }
  @Post('upload')
  @OperationLogDecorator(['指标', '上传指标zip文件'])
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file) {
    const splitArr = file.originalname.split('.');
    const fileType = splitArr.pop();
    const filename = `fileUpload/${splitArr.join(
      '.'
    )}_${Date.now()}.${fileType}`;
    fs.writeFileSync(filename, file.buffer);
    return filename;
  }
  @Public()
  @Get('function/meta')
  getFunctionMeta() {
    //获取函数元数据
    const names = Object.getOwnPropertyNames(FunctionsTarget.prototype);
    //过滤掉构造函数
    const filterNames = names.filter((v) => v !== 'constructor');
    console.log(filterNames);
    const meta = filterNames.map((v) => {
      const { name, description, params } = functionMeta[v];
      return {
        name,
        description,
        params,
      };
    });
    // console.log(meta);
    return meta;
  }
}
