import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseTableListParams } from 'apps/sem-api/src/common/dto/index';
import { TaskCycle } from 'apps/sem-api/src/common/enum';
import { Utils } from 'apps/sem-api/src/common/utils/utils';
import { CategoryTaskEntity } from 'apps/sem-api/src/entity/category.task.entity';
import { TaskEntity } from 'apps/sem-api/src/entity/task.entity';
import { CronJob } from 'cron';
import { Like, Repository, In } from 'typeorm';
import { QueryId, UpdateStatus } from '../account/dto';
import { ActivityService } from '../activity/activity.service';
import { SaveCategoryDto, SaveTaskDto } from './dto';

@Injectable()
export class TaskService {
  constructor(
    private utils: Utils,

    @InjectRepository(CategoryTaskEntity)
    private readonly categoryTaskRepository: Repository<CategoryTaskEntity>,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    private schedulerRegistry: SchedulerRegistry,
    private readonly activityService: ActivityService
  ) { }
  get repo() {
    return this.taskRepository;
  }
  async getTaskCategory(qs) {
    const keyword = qs.keyword;
    const ret = await this.categoryTaskRepository.find({
      where: {
        name: keyword ? Like(`%${keyword}%`) : Like('%%'),
      },
    });
    return this.utils.arrToTree(ret);
  }
  async saveCategory(dto: SaveCategoryDto) {
    if (dto.batch && dto.batch.length > 0) {
      await this.categoryTaskRepository.save(dto.batch);
    } else {
      await this.categoryTaskRepository.save(dto);
    }
    return true;
  }
  async deleteCategory(dto: QueryId) {
    return this.categoryTaskRepository.delete(dto.id);
  }

  async getTaskList(dto: BaseTableListParams) {
    const qb = this.taskRepository
      .createQueryBuilder('task')
      .skip((dto.current - 1) * dto.pageSize)
      .take(dto.pageSize)
      .orderBy('task.id', 'DESC');
    if (dto.keyword) {
      qb.where('task.name like :keyword', {
        keyword: `%${dto.keyword}%`,
      });
    }
    const [list, count] = await qb.getManyAndCount();
    for (const v of list) {
      if (Array.isArray(v.category) && v.category.length > 0) {
        // Filter out any invalid values and ensure we have valid IDs
        const categoryIds = v.category
          .filter(id => id != null && !isNaN(Number(id)))
          .map(id => Number(id));

        if (categoryIds.length > 0) {
          v.category = await this.categoryTaskRepository.find({
            where: {
              id: In(categoryIds),
            },
            order: { id: 'ASC' },
          });
        } else {
          v.category = [];
        }
      }
    }
    return {
      list,
      count,
      page: dto.current,
      pageSize: dto.pageSize,
    };
  }
  async saveTask(dto: SaveTaskDto) {
    const info = this.taskRepository.create(dto);
    const taskInfo = await this.taskRepository.save(info);
    // if (taskInfo.cronExp && taskInfo.cycle == TaskCycle.CronExpression) {
    //   const jobName = `taskCron-${taskInfo.id}`;
    //   const job = new CronJob(taskInfo.cronExp, () => {
    //     this.activityService.dynamicCronTask(jobName);
    //   });
    //   try {
    //     this.schedulerRegistry.deleteCronJob(jobName);
    //   } catch (error) {}
    //   this.schedulerRegistry.addCronJob(jobName, job);
    //   job.start();
    // }
    return taskInfo;
  }
  async updateStatus(dto: UpdateStatus) {
    return await this.taskRepository.update(dto.id, {
      status: dto.status,
    });
  }
  async deleteTask(dto: QueryId) {
    return this.taskRepository.delete(dto.id);
  }
  async getOptions(dto) {
    return (
      this.taskRepository
        .createQueryBuilder('task')
        // .select('task.id', 'value')
        // .addSelect('task.name', 'label')
        // .addSelect('task.scheduleMode', 'scheduleMode')
        // .addSelect('task.name')
        // .addSelect('task.id', 'id')
        .orderBy('task.id', 'DESC')
        .getMany()
    );
  }
}
