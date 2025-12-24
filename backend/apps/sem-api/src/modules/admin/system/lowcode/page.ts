import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Public } from 'apps/sem-api/src/common/decorator/public';
import { User } from 'apps/sem-api/src/common/decorator/usesr.decorator';
import { LowcodePageEntity } from 'apps/sem-api/src/entity/lowcode.page.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { OperationService } from '../operation/operation.service';
import { BaseCrudService, PaginationQuery } from 'apps/sem-api/src/common/base/base-crud.service';
import {
  GetSchemaQueryDto,
  LowcodePageListQueryDto,
  PublishQueryDto,
  SaveLowcodePageDto,
  SaveSchemaDto,
  SetHomeDto,
} from './dto';

@Injectable()
export class LowCodePageService extends BaseCrudService<LowcodePageEntity> {
  constructor(@InjectRepository(LowcodePageEntity) repo: Repository<LowcodePageEntity>) {
    super(repo);
  }

  async findAllWithActivity(query: PaginationQuery) {
    const { page = 1, limit = 10, ...filters } = query;

    const [data, total] = await this.repository.findAndCount({
      where: filters as any,
      relations: ['activity'],
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

@Controller('lowcode/page')
export class LowCodePageController {
  constructor(
    public service: LowCodePageService,
    public opSvr: OperationService,
    private dataSource: DataSource
  ) { }

  @Get()

  async getMany(@Query() query: LowcodePageListQueryDto) {
    return this.service.findAllWithActivity(query);
  }

  @Get(':id')


  async getOne(@Param('id') id: string) {
    return this.service.findOne(Number(id), ['activity']);
  }

  @Post()

  async createOne(@Body() dto: SaveLowcodePageDto) {
    const result = await this.service.create(dto);

    if (result.isHome) {
      const repo = this.dataSource.getRepository(LowcodePageEntity);
      await repo.update(
        {
          uuid: Not(result.uuid),
          activity: { id: result.activity.id },
        },
        {
          isHome: 0,
        }
      );
    }

    return result;
  }

  @Delete(':id')


  async deleteOne(@Param('id') id: string) {
    await this.dataSource
      .getRepository(LowcodePageEntity)
      .update({ id: Number(id) }, { isDel: true });
    return { success: true };
  }

  @Post('/saveSchema')
  async saveSchema(@Body() body: SaveSchemaDto) {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(LowcodePageEntity)
      .set({
        schema: body.schema,
      })
      .where({ uuid: body.uuid || '' })
      .execute();
    return result.affected;
  }

  @Get('/getSchema')
  @Public()
  async getSchema(@Query() qs: GetSchemaQueryDto) {
    const result = await this.dataSource
      .createQueryBuilder(LowcodePageEntity, 'page')
      .leftJoinAndSelect('page.activity', 'act')
      .where({
        uuid: qs.uuid || '',
      })
      .getOne();
    return result;
  }

  @Get('/publish')
  async publish(@Query() qs: PublishQueryDto, @User() user: any) {
    const page = await this.getSchema(qs);
    if (page && page.schema) {
      this.opSvr.addLog({
        body: page.schema,
        module: 'lowcode',
        content: `发布页面: ${page.uuid}`,
        user: user.id,
      });
    }
    const ret = await this.dataSource
      .createQueryBuilder()
      .update(LowcodePageEntity)
      .set({
        prodSchemaUrl: () => '`schema`',
        publishTime: new Date().toJSON(),
      })
      .where({ uuid: qs.uuid || '' })
      .execute();
    return ret.affected;
  }

  @Post('/sethome')
  async setHome(@Body() body: SetHomeDto) {
    if (body.uuid) {
      const repo = this.dataSource.getRepository(LowcodePageEntity);
      const info = await repo.findOne({ where: { uuid: body.uuid } });
      if (info) {
        await repo.update(
          {
            uuid: info.uuid,
          },
          {
            isHome: 1,
          }
        );
        // 清空其他
        if (info.activityId) {
          await repo.update(
            {
              uuid: Not(info.uuid),
              activity: { id: info.activityId },
            },
            {
              isHome: 0,
            }
          );
        }
      }
      return 1;
    }
    return 0;
  }
}
