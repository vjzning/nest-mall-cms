import { Body, Controller, Delete, Get, Injectable, Param, Post, Query } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { TagRuleEntity } from 'apps/sem-api/src/entity/tag.rule.entity';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'apps/sem-api/src/common/base/base-crud.service';
import { SaveTagRuleDto, TagRuleListQueryDto } from './dto';

@Injectable()
export class UserTagRuleService extends BaseCrudService<TagRuleEntity> {
  constructor(@InjectRepository(TagRuleEntity) repo: Repository<TagRuleEntity>) {
    super(repo);
  }
}

@Controller('/user/tag')
export class UserTagRuleController {
  constructor(public service: UserTagRuleService) { }

  @Get()

  async getMany(@Query() query: TagRuleListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')


  async getOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Post()

  async createOne(@Body() dto: SaveTagRuleDto) {
    return this.service.create(dto);
  }

  @Delete(':id')


  async deleteOne(@Param('id') id: string) {
    await this.service.softDelete(Number(id));
    return { success: true };
  }
}
