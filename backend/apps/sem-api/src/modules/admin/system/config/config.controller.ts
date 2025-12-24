import { Body, Controller, Get, Post } from '@nestjs/common';
import { SystemConfigService } from './config.service';
import { SaveConfig } from './dto';
import { OperationLogDecorator } from 'apps/sem-api/src/common/decorator/operation';

@Controller('config')
export class SystemConfigController {
  constructor(private readonly sysConfigService: SystemConfigService) {}
  @Get('/get')
  get() {
    return this.sysConfigService.getSysConfig();
  }
  @Post('/save')
  @OperationLogDecorator(['分组管理', '保存'])
  save(@Body() body: SaveConfig) {
    return this.sysConfigService.saveSysConfig(body);
  }
}
