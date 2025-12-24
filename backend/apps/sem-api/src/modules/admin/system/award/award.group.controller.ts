import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Public } from 'apps/sem-api/src/common/decorator/public';
import { AwardGroupEntity } from 'apps/sem-api/src/entity/award.group.entity';
import { Not, Repository } from 'typeorm';
import { BaseCrudService, PaginationQuery } from 'apps/sem-api/src/common/base/base-crud.service';
import { AwardGroupListQueryDto, SaveAwardGroupDto } from './group.dto';

@Injectable()
export class AwardGroupService extends BaseCrudService<AwardGroupEntity> {
  constructor(@InjectRepository(AwardGroupEntity) repo: Repository<AwardGroupEntity>) {
    super(repo);
  }

  async findAllWithRelations(query: PaginationQuery) {
    const { page = 1, limit = 10, ...filters } = query;

    // 默认过滤已删除的记录
    const where = { ...filters, isDel: false };

    const [data, total] = await this.repository.findAndCount({
      where,
      relations: [
        'probLevelAwards',
        'probLevelAwards.awardsInstance',
        'probLevelAwards.awardsInstance.award',
        'probLevelAwards.childrenAwardGroup',
      ],
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
      relations: [
        'probLevelAwards',
        'probLevelAwards.awardsInstance',
        'probLevelAwards.awardsInstance.award',
        'probLevelAwards.childrenAwardGroup',
      ],
    });
  }
}

@Controller('award/group')
export class AwardGroupController {
  constructor(public service: AwardGroupService) { }

  @Get()

  async getMany(@Query() query: AwardGroupListQueryDto) {
    return this.service.findAllWithRelations(query);
  }

  @Get(':id')


  async getOne(@Param('id') id: string) {
    return this.service.findOneWithRelations(Number(id));
  }

  @Post()

  async createOne(@Body() dto: SaveAwardGroupDto) {
    return this.service.create(dto);
  }

  @Patch(':id')


  async updateOne(@Param('id') id: string, @Body() dto: SaveAwardGroupDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')


  async deleteOne(@Param('id') id: string) {
    await this.service.softDelete(Number(id));
    return { success: true };
  }

  @Public()
  @Get('/options/:id')


  async getOptions(@Param('id') id: string) {
    const result = await this.service.repo.find({
      where: {
        isDel: false,
        id: Not(Number(id)),
      },
      relations: ['probLevelAwards', 'probLevelAwards.childrenAwardGroup'],
    });

    // 过滤出没有子分组的奖励分组
    const options = result.filter(
      (i) => !!i.probLevelAwards.find((j) => j.childrenAwardGroup === null)
    );

    return options;
  }
}
