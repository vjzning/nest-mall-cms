import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseTableListParams } from 'apps/sem-api/src/common/dto/index';
import { ActivityDraftEntity } from 'apps/sem-api/src/entity/activities.draft.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DarftService {
  constructor(
    @InjectRepository(ActivityDraftEntity)
    private readonly draftRepository: Repository<ActivityDraftEntity>
  ) {}
  async save(data) {
    return await this.draftRepository.save(data);
  }
  async findList(dto: BaseTableListParams) {
    const ret = await this.draftRepository.find({
      select: ['config', 'id'],
    });
    return ret;
  }
  async del(id) {
    return this.draftRepository.delete(id);
  }
}
