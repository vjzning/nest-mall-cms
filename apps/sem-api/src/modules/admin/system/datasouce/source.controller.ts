import { Body, Controller, Delete, Get, Injectable, Param, Post, Query } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSourceEntity } from 'apps/sem-api/src/entity/datasource.entity';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'apps/sem-api/src/common/base/base-crud.service';
import { DataSourceListQueryDto, SaveDataSourceDto } from './dto';

@Injectable()
export class DataSourceService extends BaseCrudService<DataSourceEntity> {
  constructor(@InjectRepository(DataSourceEntity) repo: Repository<DataSourceEntity>) {
    super(repo);
  }
}

@Controller('datasource')
export class DataSourceController {
  constructor(public service: DataSourceService) { }

  @Get()

  async getMany(@Query() query: DataSourceListQueryDto) {
    return this.service.findAll(query);
  }



  async getOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Post()

  async createOne(@Body() dto: SaveDataSourceDto) {
    return this.service.create(dto);
  }

  @Delete(':id')


  async deleteOne(@Param('id') id: string) {
    await this.service.delete(Number(id));
    return { success: true };
  }
}
