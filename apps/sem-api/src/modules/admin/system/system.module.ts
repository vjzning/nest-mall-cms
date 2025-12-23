import {
  Inject,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utils } from 'apps/sem-api/src/common/utils/utils';
import { AccessEntity } from 'apps/sem-api/src/entity/access.entity';
import { AccessController } from './account/access.controller';
import { AccountController } from './account/account.controller';
import { AccountService } from './account/account.service';
import { RoleController } from './account/role.controller';
import { ActivityConsumer } from './activity/activity.consumer';
import { ActivityController } from './activity/activity.controller';
import { ActivityService } from './activity/activity.service';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { AwardController } from './award/award.controller';
import { AwardService } from './award/award.service';
import { BusTargetController } from './bustarget/bustarget.controller';
import { BusTargetService } from './bustarget/bustarget.service';
import { SystemConfigController } from './config/config.controller';
import { SystemConfigService } from './config/config.service';
import { DraftController } from './draft/activity.controller';
import { DarftService } from './draft/activity.service';
import { OperationController } from './operation/operation.controller';
import { OperationService } from './operation/operation.service';
import { StatisticController } from './statistic/statistic.controller';
import { StatisticService } from './statistic/statistic.service';
import { TaskController } from './task/task.controller';
import { TaskService } from './task/task.service';
import { CronJob } from 'cron';
import { ConfigService } from '@nestjs/config';
import { UploaderController } from './uploader/upload.controller';
import {
  DataSourceController,
  DataSourceService,
} from './datasouce/source.controller';
import {
  RuleConfigService,
  RuleConfigController,
} from './datasouce/rule.controller';
import { KafkaService } from './activity/kafkajs';
import {
  AwardGroupController,
  AwardGroupService,
} from './award/award.group.controller';
import { LowCodePageController, LowCodePageService } from './lowcode/page';
import { LowCodeBlockController, LowCodeBlockService } from './lowcode/block';
import entities from 'apps/sem-api/src/entity';
import {
  UserTagRuleController,
  UserTagRuleService,
} from './user/tag.controller';
import {
  UserTagMapController,
  UserTagMapService,
} from './user/user.tag.controller';
import {
  BusinessUserService,
  BusinessUserController,
} from './user/user.controller';
import {
  WarningNoticeController,
  WarningNoticeService,
} from './warning/notice';
import { FunctionsTarget } from 'apps/sem-api/src/common/utils/function_target';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpService } from '@nestjs/axios';
@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  controllers: [
    AccountController,
    AccessController,
    RoleController,
    TaskController,
    AwardController,
    ActivityController,
    StatisticController,
    SystemConfigController,
    BusTargetController,
    OperationController,
    DraftController,
    AppController,
    UploaderController,
    DataSourceController,
    RuleConfigController,
    AwardGroupController,

    //lowcode
    LowCodePageController,
    LowCodeBlockController,

    UserTagRuleController,
    UserTagMapController,
    BusinessUserController,
    WarningNoticeController,
  ],
  providers: [
    KafkaService,
    AccountService,
    TaskService,
    AwardService,
    ActivityService,
    StatisticService,
    SystemConfigService,
    BusTargetService,
    OperationService,
    AppService,
    ActivityConsumer,
    DarftService,
    DataSourceService,
    RuleConfigService,
    AwardGroupService,
    LowCodePageService,
    LowCodeBlockService,

    UserTagRuleService,
    UserTagMapService,
    BusinessUserService,
    WarningNoticeService,
    Utils,
    FunctionsTarget,
  ],
  exports: [
    TypeOrmModule,
    AccountService,
    KafkaService,
    OperationService,
    Utils,
    FunctionsTarget,
  ],
})
export class SysModule implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private schedulerRegistry: SchedulerRegistry,
    private readonly activityService: ActivityService,
    private readonly kafkaService: KafkaService,
  ) { }
  onModuleInit() {
    this.httpService.axiosRef.interceptors.request.use((req) => {
      return req;
    });
    //动态创建定时器.
    const jobName = `task-cronjob-day`;
    const delayMin = this.configService.get<number>('TaskDelayOffset') || 10;
    const cronTime = `0 ${delayMin} 0 * * *`;
    const job = new CronJob(cronTime, async () => {
      await this.activityService.handleCronByDay();
    });
    this.schedulerRegistry.addCronJob(jobName, job as any);
    job.start();
  }
  async onApplicationBootstrap() {
    console.log('onApplicationBootstrap');
    const topic = this.configService.get<string>('KafkaTopic');
    // const groupId = this.configService.get<string>('KafkaGroupId');
    this.kafkaService
      .consumerRun(topic)
      .catch((e) => console.error(`[activity/consumer] ${e.message}`));
    // this.kafkaService.admin().catch((e) => console.error(e.message));
    // setInterval(() => this.kafkaService.admin(), 5000);
    // 创建一个定时器。每10分钟运行 cron expression
    const cronTime = `0 */10 * * * *`;
    const job = new CronJob(cronTime, async () => {
      await this.kafkaService.admin();
    });
    this.schedulerRegistry.addCronJob('monitorConsumerGroupState', job as any);
    job.start();
    this.activityService.asyncDataToRedis();
  }
}
