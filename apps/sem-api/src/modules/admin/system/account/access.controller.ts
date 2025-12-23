import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { NoAuth } from 'apps/sem-api/src/common/decorator/no.auth';
import { OperationLogDecorator } from 'apps/sem-api/src/common/decorator/operation';
import { Public } from 'apps/sem-api/src/common/decorator/public';
import { OperationLogEntity } from 'apps/sem-api/src/entity/operation.log.entity';
import { Repository } from 'typeorm';
import { AccountService } from './account.service';
import { CreateAccessDto, QueryId } from './dto';

@Controller('access')
export class AccessController {
  constructor(private readonly accountService: AccountService) {}
  @Post()
  @OperationLogDecorator(['资源', '添加'])
  async create(@Body() dto: CreateAccessDto) {
    return this.accountService.createAccess(dto);
  }
  @Get('menus')
  @NoAuth()
  async getMenus(@Req() req) {
    if (!req.user) return [];
    return await this.accountService.getMenuList(req?.user?.id);
  }
  @Get('all')
  async getAllAccess() {
    return this.accountService.getAllAccess();
  }
}
