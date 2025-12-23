import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ActivityEntity } from 'apps/sem-api/src/entity/activities.entity';
import { ActivityTaskEntity } from 'apps/sem-api/src/entity/activities.task.entity';
import { Job } from 'bullmq';
import { ActivityService } from './activity.service';
import { nanoid } from 'nanoid';
import {
  ConditionUnique,
  SwitchStatus,
  TaskScheduleMode,
} from 'apps/sem-api/src/common/enum';
import {
  DAILYSCHEDULINGTASKS,
  SEND_AWARD_TASKS,
} from 'apps/sem-api/src/common/constants/const';
import * as moment from 'moment';
import { AwardService } from '../award/award.service';
import { Utils } from 'apps/sem-api/src/common/utils/utils';
import { RedisLockService } from '@app/sem-api/modules/redisLock/redisLock.service';
import { Inject, Logger } from '@nestjs/common';
@Processor('activity')
export class ActivityConsumer extends WorkerHost {
  private readonly logger = new Logger(ActivityConsumer.name);
  constructor(
    private readonly activityService: ActivityService,
    private readonly awardService: AwardService,
    private readonly utils: Utils,
    private readonly redisLock: RedisLockService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'checkActivityTaskComplete':
        return this.run(job);
      case DAILYSCHEDULINGTASKS:
        return this.runTask(job);
      case SEND_AWARD_TASKS:
        return this.sendAward(job);
    }
  }
  // @Process('checkActivityTaskComplete')
  async run(job: Job<ActivityEntity>) {
    this.logger.log('活动结束时间调用...' + job.id);
    const lockRet = await this.redisLock.lockOnce('actEnd:' + job.id, 1000);
    if (lockRet) {
      const actInfo = await this.activityService.getInfo(job.data.uniqueCode);
      const resultInfo = {};
      if (actInfo.status == SwitchStatus.Yes && !actInfo.isDel) {
        for (const taskInstance of actInfo.tasks) {
          //只执行活动结束调用的条件
          taskInstance.taskConditions = taskInstance.taskConditions.filter(
            (cond) => cond.sendLimit == ConditionUnique.Permanent
          );
          taskInstance.runTime = job.timestamp;
          taskInstance.activity = {
            id: actInfo.id,
            uniqueCode: actInfo.uniqueCode,
          };
          this.logger.log(
            '活动结束调用条件...',
            taskInstance.taskConditions.map((i) => i.id).join(',')
          );
          if (taskInstance?.taskConditions?.length == 0) {
            this.logger.log('未找到符合的条件');
          }
          const result = await this.activityService.getCompleteAndInster(
            taskInstance,
            actInfo
          );
          resultInfo[taskInstance.id] = result;
        }
        return resultInfo;
      } else {
        this.logger.log('已下线或者删除', 'checkActivityFinish');
      }
    }
  }

  //定时.
  // @Process(DAILYSCHEDULINGTASKS)
  async runTask(job: Job<ActivityTaskEntity>) {
    const lockRet = await this.redisLock.lockOnce('task:' + job.id, 1000);
    if (lockRet) {
      const taskInfo = job.data;
      if (!taskInfo.runTime) {
        taskInfo.runTime = job.timestamp;
      }
      // 查询活动信息。
      const actInfo = await this.activityService.getInfo(
        taskInfo.activity.uniqueCode
      );
      actInfo['runTime'] = job.timestamp;
      if (actInfo.status == SwitchStatus.Yes && !actInfo.isDel) {
        return await this.activityService.getCompleteAndInster(
          taskInfo,
          actInfo
        );
      } else {
        this.logger.log('已下线或者删除', DAILYSCHEDULINGTASKS);
      }
    }
  }

  //发送奖励
  // @Process(SEND_AWARD_TASKS)
  async sendAward(job: Job<number>) {
    const id = job.data;
    await this.awardService.sendAward(
      {
        checkId: id,
      },
      TaskScheduleMode.Passive
    );
  }

  // @Process('test')
  async runTest(job: Job) {
    console.log(job.id, job.name, job.data);
  }
}
