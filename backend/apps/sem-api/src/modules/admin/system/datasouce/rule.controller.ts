import { Body, Controller, Delete, Get, Injectable, Param, Post, Query } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { RuleConfigEntity } from 'apps/sem-api/src/entity/rule.config.entity';
import { Repository } from 'typeorm';
import { BaseCrudService, PaginationQuery } from 'apps/sem-api/src/common/base/base-crud.service';
import { RuleConfigListQueryDto, SaveRuleConfigDto } from './dto';

@Injectable()
export class RuleConfigService extends BaseCrudService<RuleConfigEntity> {
  constructor(@InjectRepository(RuleConfigEntity) repo: Repository<RuleConfigEntity>) {
    super(repo);
  }

  async findAllWithSource(query: PaginationQuery) {
    const { page = 1, limit = 10, ...filters } = query;

    const [data, total] = await this.repository.findAndCount({
      where: filters as any,
      relations: ['source'],
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      order: { id: 'DESC' },
    });

    return {
      data,
      total,
      page: Number(page),
      pageSize: Number(limit),
    };
  }
}

@Controller('rule/config')
export class RuleConfigController {
  constructor(public service: RuleConfigService) { }

  @Get()

  async getMany(@Query() query: RuleConfigListQueryDto) {
    return this.service.findAllWithSource(query);
  }

  @Get(':id')


  async getOne(@Param('id') id: string) {
    return this.service.findOne(Number(id), ['source']);
  }

  @Post()

  async createOne(@Body() dto: SaveRuleConfigDto) {
    return this.service.create(dto);
  }

  @Delete(':id')


  async deleteOne(@Param('id') id: string) {
    await this.service.delete(Number(id));
    return { success: true };
  }
}
