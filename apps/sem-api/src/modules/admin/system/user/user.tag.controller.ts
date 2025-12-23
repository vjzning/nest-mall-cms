import { Body, Controller, Delete, Get, Injectable, Param, Post, Query } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Utils } from 'apps/sem-api/src/common/utils/utils';
import { UserTagEntity } from 'apps/sem-api/src/entity/tag.rule.user.entity';
import { Repository } from 'typeorm';
import { BaseCrudService, PaginationQuery } from 'apps/sem-api/src/common/base/base-crud.service';
import { SaveUserTagMapDto, UserTagMapListQueryDto } from './dto';

@Injectable()
export class UserTagMapService extends BaseCrudService<UserTagEntity> {
  constructor(@InjectRepository(UserTagEntity) repo: Repository<UserTagEntity>) {
    super(repo);
  }

  async findAllWithRelations(query: PaginationQuery) {
    const { page = 1, limit = 10, ...filters } = query;

    const where: any = { ...filters };
    if (where.userId !== undefined && where.userId !== null && where.userId !== '') {
      where.user = { id: Number(where.userId) };
      delete where.userId;
    }
    if (where.tagId !== undefined && where.tagId !== null && where.tagId !== '') {
      where.tag = { id: Number(where.tagId) };
      delete where.tagId;
    }

    const [data, total] = await this.repository.findAndCount({
      where,
      relations: ['user', 'tag'],
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

  async findOneWithRelations(id: number) {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'tag'],
    });
  }
}

@Controller('/user-tag/map')
export class UserTagMapController {
  constructor(
    private utils: Utils,
    public service: UserTagMapService
  ) { }

  @Get()

  async getMany(@Query() query: UserTagMapListQueryDto) {
    return this.service.findAllWithRelations(query);
  }

  @Get(':id')


  async getOne(@Param('id') id: string) {
    return this.service.findOneWithRelations(Number(id));
  }

  @Post()

  async createOne(@Body() dto: SaveUserTagMapDto) {
    const ret = await this.service.create(dto);

    // 清除缓存
    if (ret.user?.businessUserId) {
      const key = this.utils.getUserTagMapKey(ret.user.businessUserId);
      await this.utils.cache.del(key);
    }

    return ret;
  }

  @Delete(':id')


  async deleteOne(@Param('id') id: string) {
    const info = await this.service.findOneWithRelations(Number(id));
    await this.service.delete(Number(id));

    // 清除缓存
    if (info?.user?.businessUserId) {
      const key = this.utils.getUserTagMapKey(info.user.businessUserId);
      await this.utils.cache.del(key);
    }

    return { success: true };
  }
}
