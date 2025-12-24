import { Inject, Injectable } from '@nestjs/common';
import { SchedulerRegistry, Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Utils } from 'apps/sem-api/src/common/utils/utils';
import { AccessTokenEntity } from 'apps/sem-api/src/entity/access.token.entity';
import { Repository } from 'typeorm';
@Injectable()
export class AppService {
  constructor(
    private readonly utils: Utils,
    @InjectRepository(AccessTokenEntity)
    private readonly appRepository: Repository<AccessTokenEntity>
  ) {}
  async getAppList() {
    const list = await this.appRepository.find({
      select: ['appId', 'appName'],
      order: {
        id: 'DESC',
      },
    });
    return list;
  }
  async createApp(appName) {
    const entity = new AccessTokenEntity();
    entity.appSecret = this.utils.buildRandomStr();
    entity.appName = appName;
    entity.appId = this.utils.buildRandomStr(12);
    return this.appRepository.save(entity);
  }
}
