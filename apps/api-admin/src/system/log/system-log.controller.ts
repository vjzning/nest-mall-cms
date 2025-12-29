import { Controller, Get, Query, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SystemLogService } from './system-log.service';
import { RequirePermissions } from '../../common/decorators/auth.decorator';

@Controller('system/logs')
export class SystemLogController {
  constructor(private readonly systemLogService: SystemLogService) {}

  @Get()
  @RequirePermissions('system:log:list')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('username') username?: string,
    @Query('module') module?: string,
    @Query('status') status?: number,
  ) {
    return this.systemLogService.findAll({
      page: Number(page),
      limit: Number(limit),
      username,
      module,
      status: status !== undefined ? Number(status) : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('system:log:query')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.systemLogService.findOne(id);
  }
}
