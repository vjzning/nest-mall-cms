import { Body, Controller, Delete, Get, Injectable, Param, Post, Query } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { LowcodeBlockEntity } from 'apps/sem-api/src/entity/lowcode.block';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'apps/sem-api/src/common/base/base-crud.service';
import { LowcodeBlockListQueryDto, SaveLowcodeBlockDto } from './dto';

@Injectable()
export class LowCodeBlockService extends BaseCrudService<LowcodeBlockEntity> {
  constructor(@InjectRepository(LowcodeBlockEntity) repo: Repository<LowcodeBlockEntity>) {
    super(repo);
  }
}

@Controller('lowcode/block')
export class LowCodeBlockController {
  constructor(public service: LowCodeBlockService) { }

  @Get()

  async getMany(@Query() query: LowcodeBlockListQueryDto) {
    return this.service.findAll(query);
  }

  @Post()

  async createOne(@Body() dto: SaveLowcodeBlockDto) {
    return this.service.create(dto);
  }

  @Delete(':id')


  async deleteOne(@Param('id') id: string) {
    await this.service.delete(Number(id));
    return { success: true };
  }
}
