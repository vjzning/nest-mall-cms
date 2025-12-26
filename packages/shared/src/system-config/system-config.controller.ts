import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { SystemConfigEntity } from '@app/db/entities/system-config.entity';

@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly configService: SystemConfigService) {}

  @Get()
  async findAll() {
    const configs = await this.configService.findAll();
    // Mask sensitive values for frontend
    return configs.map(config => ({
      ...config,
      value: config.isEncrypted ? '******' : config.value,
    }));
  }

  @Post()
  async create(@Body() data: Partial<SystemConfigEntity>) {
    return this.configService.create(data);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<SystemConfigEntity>) {
    return this.configService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.configService.remove(id);
  }

  @Post('refresh')
  async refresh() {
    await this.configService.refreshCache();
    return { message: 'Config cache refreshed' };
  }
}
