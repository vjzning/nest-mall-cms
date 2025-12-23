import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityEntity } from 'apps/sem-api/src/entity/activities.entity';
import { AwardEntity } from 'apps/sem-api/src/entity/award.entity';
import { BusinessTargetEntity } from 'apps/sem-api/src/entity/business.arget.entity';
import { TaskEntity } from 'apps/sem-api/src/entity/task.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(AwardEntity)
    private readonly awardRepository: Repository<AwardEntity>,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
    @InjectRepository(BusinessTargetEntity)
    private readonly targetRepository: Repository<BusinessTargetEntity>
  ) { }
  async getAwardCnt() {
    return await this.awardRepository.count();
  }
  async getTaskCnt() {
    return await this.taskRepository.count();
  }
  async getActivicyCnt() {
    // where['start_time'] = LessThan(new Date());
    // where['end_time'] = MoreThan(new Date());
    return await this.activityRepository.count({
      where: {
        isDel: false,
        end_time: MoreThan(new Date().toJSON()),
        start_time: LessThan(new Date().toJSON()),
      },
    });
  }
  async getTargetCnt() {
    return await this.targetRepository.count();
  }
}
