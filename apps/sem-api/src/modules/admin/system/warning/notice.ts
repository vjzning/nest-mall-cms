import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Body, Controller, Delete, Get, Inject, Injectable, Logger, Param, Post, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WarningNoticeEntity } from 'apps/sem-api/src/entity/warning.notice.entity';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'apps/sem-api/src/common/base/base-crud.service';
import { SaveWarningNoticeDto, WarningNoticeListQueryDto } from './dto';

@Injectable()
export class WarningNoticeService extends BaseCrudService<WarningNoticeEntity> {
  private readonly logger = new Logger(WarningNoticeService.name);

  constructor(
    @InjectRepository(WarningNoticeEntity) repo: Repository<WarningNoticeEntity>,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache
  ) {
    super(repo);
  }

  get cache() {
    return this.cacheManager;
  }

  async getOneInfo(actCode: string) {
    const waringInfo = await this.cacheManager.wrap<WarningNoticeEntity>(
      `warn:${actCode}`,
      async () => {
        return await this.repository.findOne({
          where: {
            notifyKey: actCode,
          },
        });
      }
    );
    return waringInfo;
  }
}

@Controller('warning/notice')
export class WarningNoticeController {
  constructor(public service: WarningNoticeService) { }

  @Get()
  async getMany(@Query() query: WarningNoticeListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Post()
  async createOne(@Body() dto: SaveWarningNoticeDto) {
    const ret = await this.service.create(dto);

    // 更新缓存
    if (ret.notifyKey) {
      await this.service.cache.set(`warn:${ret.notifyKey}`, ret);
    }

    return ret;
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    const info = await this.service.findOne(Number(id));
    await this.service.delete(Number(id));

    // 清除缓存
    if (info?.notifyKey) {
      await this.service.cache.del(`warn:${info.notifyKey}`);
    }

    return { success: true };
  }
}
