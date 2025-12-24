import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { SystemConfigService } from './system-config.service';
import { SystemConfigEntity } from '@app/db/entities/system-config.entity';

@Controller('system-config')
@UseGuards(AuthGuard('jwt'))
export class SystemConfigController {
  constructor(private readonly configService: SystemConfigService) {}

  @Get()
  @RequirePermissions('system:config:list')
  async findAll() {
    const configs = await this.configService.findAll();
    // Mask sensitive values for frontend
    return configs.map(config => ({
      ...config,
      value: config.isEncrypted ? '******' : config.value,
    }));
  }

  @Post()
  @RequirePermissions('system:config:create')
  async create(@Body() data: Partial<SystemConfigEntity>) {
    return this.configService.create(data);
  }

  @Put(':id')
  @RequirePermissions('system:config:update')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<SystemConfigEntity>) {
    return this.configService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('system:config:delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.configService.remove(id);
  }

  @Post('refresh')
  @RequirePermissions('system:config:update')
  async refresh() {
    await this.configService.refreshCache();
    return { message: 'Config cache refreshed' };
  }
}
