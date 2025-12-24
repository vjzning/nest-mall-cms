import { InjectQueue } from '@nestjs/bullmq';
import {
  Inject,
  Injectable,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BaseTableListParams,
  IndicatorDto,
  TableListParams,
} from 'apps/sem-api/src/common/dto/index';
import { ActivityEntity } from 'apps/sem-api/src/entity/activities.entity';
import { TaskAwardInstanceEntity } from 'apps/sem-api/src/entity/activities.task.award';
import { ActivityTaskEntity } from 'apps/sem-api/src/entity/activities.task.entity';
import { AwardCheckInfoEntity } from 'apps/sem-api/src/entity/award.check';
import { AwardEntity } from 'apps/sem-api/src/entity/award.entity';
import { BusinessTargetEntity } from 'apps/sem-api/src/entity/business.arget.entity';
import { CompleteTaskUserEntity } from 'apps/sem-api/src/entity/complete.task.user.entity';
import { TaskEntity } from 'apps/sem-api/src/entity/task.entity';
import { MyHttpException } from 'apps/sem-api/src/common/exception/my.http.exception';
import { Utils } from 'apps/sem-api/src/common/utils/utils';
import AxiosRetry from 'axios-retry';
import { Queue } from 'bullmq';
import * as _ from 'lodash';
import { RedisLockService } from '@app/sem-api/modules/redisLock/redisLock.service';
import * as util from 'util';
import { nanoid } from 'nanoid';
import * as AWS from 'aws-sdk';
import { Decimal } from 'decimal.js';
import { ErrorCode } from 'apps/sem-api/src/common/constants/error';

import {
  ActivityTimeStatus,
  AwardNumberType,
  CheckStatus,
  ConditionUnique,
  RankingType,
  ResourceType,
  SwitchStatus,
  TargetType,
  TaskCycle,
  TaskScheduleMode,
  TaskTiming,
} from 'apps/sem-api/src/common/enum/index';
import {
  Between,
  FindOneOptions,
  In,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Repository,
  Transaction,
  DataSource,
} from 'typeorm';
import { UpdateStatus } from '../account/dto';
import { AwardService }  from '../award/award.service';
import {
  ActivityTaskDto,
  CreateActivityDto,
  CreateAwardCheckDto,
  ProbMapAward,
  SaveAwardDto,
  SendMsgDto,
  SrcAwardMap,
} from './dto';
// import { CompleteTaskUserEntity } from 'apps/sem-api/src/entity/complete.task.user.entity';
import * as moment from 'moment';
import { TaskConditionEntity } from 'apps/sem-api/src/entity/task.condition.entity';
import { ConfigService } from '@nestjs/config';
import {
  DAILYSCHEDULINGTASKS,
  SEND_AWARD_TASKS,
} from 'apps/sem-api/src/common/constants/const';
import { RankingRuleEntity } from 'apps/sem-api/src/entity/ranking.config.entity';
import { RuleConfigEntity } from 'apps/sem-api/src/entity/rule.config.entity';
import { AwardGroupProbEntity } from 'apps/sem-api/src/entity/award.group.prob.entity';
import { AwardGroupEntity } from 'apps/sem-api/src/entity/award.group.entity';
import { cond, conforms, now } from 'lodash';
import { Cache } from 'cache-manager';

import { UserTagEntity } from 'apps/sem-api/src/entity/tag.rule.user.entity';
import { TagRuleEntity } from 'apps/sem-api/src/entity/tag.rule.entity';
import { CategoryAwardEntity } from 'apps/sem-api/src/entity/category.award.entity';
import { UserResouceEntity } from 'apps/sem-api/src/entity/user.resource';
import { BusinessBaseUserEntity } from 'apps/sem-api/src/entity/business.user.entity';
import { SendAwardDto } from '../award/dto';
import { timeStamp } from 'console';

import { FunctionsTarget } from 'apps/sem-api/src/common/utils/function_target';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);
  constructor(
    private utils: Utils,
    private funcTarget: FunctionsTarget,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => AwardService))
    private readonly awardService: AwardService,
    @InjectQueue('activity') private activityQueue: Queue,
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
    @InjectRepository(ActivityTaskEntity)
    private readonly activityTaskRepository: Repository<ActivityTaskEntity>,
    @InjectRepository(BusinessTargetEntity)
    private readonly bustargetRepository: Repository<BusinessTargetEntity>,
    @InjectRepository(AwardCheckInfoEntity)
    private readonly awardCheckRepository: Repository<AwardCheckInfoEntity>,
    @InjectRepository(CompleteTaskUserEntity)
    private readonly completeTaskRepository: Repository<CompleteTaskUserEntity>,
    @InjectRepository(AwardGroupEntity)
    private readonly awardGroupRepository: Repository<AwardGroupEntity>,

    @InjectRepository(BusinessTargetEntity)
    private readonly businessTargeRepository: Repository<BusinessTargetEntity>,

    @InjectRepository(AwardEntity)
    private readonly awardRepository: Repository<AwardEntity>,
    @InjectRepository(CategoryAwardEntity)
    private readonly categoryRepository: Repository<CategoryAwardEntity>,
    private readonly redisLock: RedisLockService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
    private dataSource: DataSource
  ) {
    AxiosRetry(this.httpService.axiosRef, { retries: 3 });
    moment.updateLocale('en', {
      week: {
        dow: 1, // First day of week is Monday
        doy: 7, // First week of year must contain 1 January (7 + 1 - 1)
      },
    });
  }
  /**
   * 根据条件获取活动任务列表
   * @param where
   * @returns {Promise<*>}
   */
  async getActivityTaskList(where) {
    return await this.activityTaskRepository.find({
      cache: true,
      where,
    });
  }
  async handleCronByDay() {
    const lockName = 'lock:taskLockByDay';
    if (await this.redisLock.lockOnce(lockName, 5 * 60 * 1000)) {
      this.logger.log('run cron...');
      const now = moment().startOf('day');
      const activities = await this.activityRepository
        .createQueryBuilder('act')
        .where({
          isDel: false,
          status: SwitchStatus.Yes,
          start_time: LessThanOrEqual(new Date()),
          end_time: MoreThan(now.subtract(1, 'day').toDate()),
        })
        .getMany();
      for (const item of activities) {
        const actInfo = await this.getInfo(item.uniqueCode);
        for (const taskInstance of actInfo.tasks) {
          const taskStartTime = moment(taskInstance.start_time);
          const matchConditons: TaskConditionEntity[] = [];
          for (const cond of taskInstance.taskConditions) {
            const currentDay = new Date().getDate();
            const isLeapYear = moment().isLeapYear();
            const month = new Date().getMonth();
            const diffDay = now.diff(taskStartTime, 'days');
            if (
              cond.sendLimit == ConditionUnique.Day ||
              (cond.sendLimit == ConditionUnique.NWeek &&
                diffDay % 7 === 0 &&
                diffDay > 0) ||
              (cond.sendLimit == ConditionUnique.Week &&
                new Date().getDay() == 1) ||
              (cond.sendLimit == ConditionUnique.Month && currentDay == 1) ||
              (cond.sendLimit == ConditionUnique.WeekOfMonth &&
                ((currentDay == 1 && !isLeapYear && month == 2) ||
                  [8, 15, 22, 29].includes(currentDay)))
            ) {
              matchConditons.push(cond);
            }
          }
          taskInstance.taskConditions = matchConditons;
          this.logger.log({
            ids: taskInstance.taskConditions.map((i) => i.id),
            msg: '匹配的任务条件',
          });
          if (taskInstance.taskConditions.length > 0) {
            taskInstance.activity = {
              id: actInfo.id,
              uniqueCode: actInfo.uniqueCode,
            };
            await this.activityQueue.add(DAILYSCHEDULINGTASKS, taskInstance, {
              jobId: `dayTask:${taskInstance.id}:${moment().format(
                'YYYYMMDD'
              )}`,
              delay: 0,
              attempts: 3,
              removeOnComplete: true,
              backoff: {
                type: 'exponential',
                delay: 60 * 1000,
              },
            });
          }
        }
      }
    }
  }
  @Cron(`0 10 */1 * * *`)
  // @Cron(`*/1 * * * * *`)
  async handleCronByHour() {
    const lockName = 'lock:taskLockByHour';
    if (await this.redisLock.lockOnce(lockName, 5 * 60 * 1000)) {
      //查询出复合条件任务实例.
      // start_time: LessThanOrEqual(new Date()),
      // end_time: MoreThanOrEqual(now.subtract(1, 'day').toDate()),
      const now = moment().startOf('h');
      const qb = this.activityTaskRepository.createQueryBuilder('t1');
      const qbQs = qb
        .leftJoinAndMapOne('t1.activity', 't1.activity', 'activity')
        .leftJoinAndSelect('t1.taskConditions', 'cond')
        .where('t1.start_time <= :sTime', { sTime: new Date() })
        .andWhere('t1.end_time > :eTime', {
          eTime: now.subtract(1, 'h').toDate(),
        })
        .andWhere('cond.sendLimit = :sendLimit', {
          sendLimit: ConditionUnique.Hour.toString(),
        })
        .andWhere('activity.isDel = :isDel', {
          isDel: false,
        })
        .andWhere('activity.status = :status', {
          status: SwitchStatus.Yes,
        });
      // const sql = qbQs.getParameters();
      const result = await qbQs.getMany();
      for (const taskInstance of result) {
        //查询条件的详细信息
        const actInfo = await this.getInfo(taskInstance.activity.uniqueCode); //缓存中获取数据
        const taskInfo = actInfo.tasks.find(
          (_task) => _task.id == taskInstance.id
        );
        taskInstance.task = taskInfo.task;
        taskInstance.taskConditions = taskInfo?.taskConditions?.filter(
          (_cond) =>
            taskInstance.taskConditions.map((i) => i.id).includes(_cond.id)
        );
        await this.activityQueue.add(DAILYSCHEDULINGTASKS, taskInstance, {
          jobId: `hourTask:${taskInstance.id}:${moment().format('YYYYMMDDHH')}`,
          delay: 0,
          attempts: 3,
          removeOnComplete: true,
          backoff: {
            type: 'exponential',
            delay: 60 * 1000,
          },
        });
      }
    }
  }
  //检测任务完成，且发送奖励,主动调用
  async checkTaskIsCompleteAndSendAward(dto) {
    const activityInfo: ActivityEntity = dto.info;
    activityInfo.tasks = activityInfo.tasks.filter((i) => i.id == dto.taskId);
    const conditionId = dto['conditionId'];
    let condIds = [];
    if (conditionId) {
      condIds = Array.isArray(conditionId)
        ? conditionId
        : [...conditionId.split(',')];
    }
    console.log(condIds, 'condition');
    const { batches = 1 } = dto;
    if (condIds.length > 0) {
      activityInfo.tasks = activityInfo.tasks.map((_task) => {
        const conditons = _task.taskConditions.filter((cond) =>
          condIds.includes(cond.id.toString())
        );
        _task.taskConditions = conditons;
        return _task;
      });
      if (activityInfo?.tasks?.[0]?.taskConditions?.length === 0) {
        throw new MyHttpException({
          statusCode: ErrorCode.TaskNotCall.CODE,
        });
      }
    }
    const taskInfos = activityInfo.tasks;
    // return;
    //活动下无实例任务.
    if (taskInfos.length === 0) {
      throw new MyHttpException({
        statusCode: ErrorCode.NotTaskInstanceNotFound.CODE,
      });
    }
    if (activityInfo.status === SwitchStatus.No) {
      //关联的活动已下线.
      throw new MyHttpException({
        statusCode: ErrorCode.ActivityOffLine.CODE,
      });
    }
    const checkRet = await this.checkTag(
      activityInfo,
      activityInfo.tagConfig,
      dto.userId
    );
    if (!checkRet) {
      throw new MyHttpException({
        statusCode: ErrorCode.ActNotOpen.CODE,
      });
    }
    const outPut: TaskAwardInstanceEntity[] = [];
    const result = await this.getTargetVal(activityInfo, dto.userId);
    for (const taskInfo of taskInfos) {
      if (taskInfo) {
        taskInfo.runTime = new Date().valueOf();
        const taskCheckRet = await this.checkTag(
          activityInfo,
          taskInfo.tagConfig,
          dto.userId
        );
        //当前用户开放tag.
        if (taskCheckRet) {
          for (const taskCondition of result[taskInfo.id]) {
            const scheduleMode =
              taskCondition?.customParam?.scheduleMode ??
              taskInfo?.task?.scheduleMode;
            if (scheduleMode != TaskScheduleMode.Active) {
              //不是主动的继续下一次循环
              this.logger.log('不是主动任务', scheduleMode);
              continue;
            }
            if (taskCondition['times'] > 0) {
              const nowTimes = taskCondition['times'];
              const preTimes =
                (await this.utils.getTimesCache<number>(
                  dto.userId,
                  taskCondition.id
                )) || 0;
              const diffTimes = nowTimes - preTimes;
              if (diffTimes > 0) {
                const awardGroupProbs = await this.saveTaskAwardLog({
                  taskCondition: taskCondition,
                  actInfo: activityInfo,
                  taskInfo: taskInfo,
                  userId: dto.userId,
                  requestId: dto.requestId,
                  times: diffTimes,
                  targetValue: taskCondition['value'],
                  totalTimes: nowTimes,
                  batches,
                });
                outPut.push(...(awardGroupProbs || []));
              }
              nowTimes > 0 &&
                (await this.utils.setTimesCache(
                  dto.userId,
                  taskCondition.id,
                  nowTimes,
                  0
                ));
            } else if (taskCondition.isComplete) {
              const awardGroupProbs = await this.saveTaskAwardLog({
                taskCondition: taskCondition,
                actInfo: activityInfo,
                taskInfo: taskInfo,
                userId: dto.userId,
                requestId: dto.requestId,
                targetValue: taskCondition['value'],
                batches,
              });
              outPut.push(...(awardGroupProbs || []));
            }
          }
        } else {
          this.logger.log(
            {
              uid: dto.userId,
              mode: taskInfo.task.scheduleMode,
            },
            '该用户未开放'
          );
        }
      }
    }
    if (outPut.length === 0) {
      throw new MyHttpException({
        statusCode: ErrorCode.GETAWARDFAIL.CODE,
      });
    }
    return outPut;
  }
  createActivity(dto: CreateActivityDto) {
    const delayMin = Number(
      this.configService.get<string>('TaskDelayOffset') || '10'
    );
    return this.dataSource.transaction(async (tManager) => {
      const activityRep = tManager.getRepository(ActivityEntity);
      const activity: ActivityEntity = activityRep.create(dto);
      if (!activity.id) {
        activity.user = dto.user;
      } else {
        delete activity.user;
      }
      if (activity.id) {
        const info = await activityRep
          .createQueryBuilder('t1')
          .where('t1.id = :id', {
            id: activity.id,
          })
          .getOne();
        if (!info || info.isDel) {
          throw new MyHttpException({
            statusCode: ErrorCode.ActNotFound.CODE,
          });
        }
      }
      const savedEntity = await activityRep.save(activity);
      if (moment(new Date(savedEntity.end_time)).isAfter(moment())) {
        const jobId = 'act:' + savedEntity.id;
        const job = await this.activityQueue.getJob(jobId);
        if (job) await job.remove();
        await this.activityQueue.add('checkActivityTaskComplete', savedEntity, {
          jobId,
          delay:
            new Date(savedEntity.end_time).valueOf() -
            Date.now() +
            (delayMin + 15) * 60 * 1000,
          attempts: 3,
          removeOnComplete: 1000,
          backoff: {
            type: 'exponential',
            delay: 60 * 1000,
          },
        });
      }
      return savedEntity;
    });
  }
  async getJobInfo(jobId) {
    const job = await this.activityQueue.getJob(jobId);
    return job;
    // const failedJob = await this.activityQueue.getFailed();
    // const completed = await this.activityQueue.getCompleted();
    // const delayed = this.activityQueue.getDelayed();
    // const active = this.activityQueue.getActive();
    // const job = await this.activityQueue.getJob('11');
    // return {
    //   failed: failedJob,
    //   completed: completed,
    //   delayed: delayed,
    //   active: active,
    // };
  }
  async getList(qs: TableListParams) {
    // console.log(qs);
    const where = {
      isDel: false,
    };
    if (qs['id']) {
      where['id'] = qs['id'];
    }
    if (qs.name) {
      where['name'] = Like(`%${qs.name}%`);
    }
    if (qs['uniqueCode']) {
      // 用 like 查询
      where['uniqueCode'] = Like(`%${qs['uniqueCode']}%`);
    }
    if (qs['actType']) {
      where['actType'] = qs['actType'];
    }
    if (qs['online'] != undefined) {
      where['status'] = qs['online'];
    }
    if (qs?.['dateRange']?.length == 2) {
      const [sdate, edate] = qs['dateRange'];
      where['start_time'] = MoreThanOrEqual(sdate + ' 00:00:00');
      where['end_time'] = LessThanOrEqual(edate + ' 23:59:59');
    }
    switch (parseInt(qs.status)) {
      case ActivityTimeStatus.NotStarted:
        where['start_time'] = MoreThan(new Date());
        break;
      case ActivityTimeStatus.Ing:
        where['start_time'] = LessThan(new Date());
        where['end_time'] = MoreThan(new Date());
        break;
      case ActivityTimeStatus.Finish:
        where['end_time'] = LessThan(new Date());
    }
    const [list, count] = await this.activityRepository
      .createQueryBuilder('act')
      // .leftJoinAndSelect('act.ruleConfig', 'rconfig')
      // .leftJoinAndSelect('act.rankingRules', 'ranking')
      // .leftJoinAndSelect('act.tasks', 'tasks')
      .leftJoinAndSelect('act.user', 'user')
      // .leftJoinAndSelect('tasks.task', 'task')
      // .leftJoinAndSelect('tasks.taskConditions', 'conditions')
      // .leftJoinAndSelect('conditions.awardsInstance', 'awardsInstance')
      // .leftJoinAndSelect('awardsInstance.award', 'award')
      .where(where)
      .orderBy({
        'act.status': 'ASC',
        'act.id': 'DESC',
      })
      .skip((qs.current - 1) * qs.pageSize)
      .take(qs.pageSize)
      .getManyAndCount();
    return {
      list: list,
      count,
      page: qs.current,
      pageSize: qs.pageSize,
    };
  }
  async getInfo(id: any) {
    const actInfo = await this.cacheManager.wrap<ActivityEntity>(
      this.utils.getActInfoCacheKey(id),
      async () => {
        const info = await this.getActivityInfo(id);
        return info;
      },
      {
        ttl: (result) => {
          const ttl =
            new Date(result.end_time).valueOf() -
            Date.now() +
            2 * 24 * 60 * 60 * 1000; //活动结束后2天时效
          return ttl < 0 ? 60 : Math.ceil(ttl / 1000);
        },
      }
    );
    return actInfo;
  }
  async updateStatus(dto: UpdateStatus) {
    return this.update(dto);
  }
  async getActivityById(id: number) {
    return this.activityRepository.findOne({
      where: {
        id,
      },
    });
  }
  async update(entiry: ActivityEntity) {
    return this.activityRepository.update(entiry.id, entiry);
  }
  async deleteActivity(id) {
    const jobId = 'act:' + id;
    const job = await this.activityQueue.getJob(jobId);
    if (job) await job.remove();
    return this.dataSource.transaction(async (trans) => {
      trans.update(
        ActivityEntity,
        {
          id: id,
        },
        {
          isDel: true,
          uniqueCode: null,
        }
      );
    });
  }
  //按照每一个条件 生成奖励数据, 返回生产的奖励数组.
  async saveTaskAwardLog(params: SaveAwardDto) {
    const {
      userId,
      taskCondition,
      actInfo,
      taskInfo,
      times = 1,
      busTime = null,
      totalTimes = 0,
      targetValue = 0,
      batches = 1,
    } = params;
    let { requestId } = params;
    const defaultTime =
      busTime ?? taskInfo.runTime ?? actInfo['runTime'] ?? moment();
    this.logger.debug(
      `${busTime} ${taskInfo.runTime} ${actInfo['runTime']}`,
      'runtime'
    );
    const nowBusTime = moment(defaultTime);
    const cloneBusTime = nowBusTime.clone();
    const completeTaskRep = this.completeTaskRepository;
    // const awardGroupRep = this.awardGroupRepository;
    if (taskCondition?.customParam?.isValidFirstDay == 1) {
      const tagsUserMap = await this.getTagRuleByUser(userId); //获取用户标签
      for (const tagRule of taskInfo?.tagConfig) {
        const userTagMap = tagsUserMap.find((i) => i?.tag?.id == tagRule.id);
        if (
          userTagMap &&
          moment(userTagMap.startTime).add(1, 'day').isBefore(nowBusTime)
        ) {
          this.logger.log('非第一天返回空奖励');
          return [];
        }
      }
    }
    const qb = completeTaskRep.createQueryBuilder('t1');
    requestId = requestId || nanoid(36);
    requestId += ':' + taskCondition.id;
    qb.leftJoinAndSelect('t1.checkInfo', 't2');
    qb.select(['t1.id', 't2.award_number', 't2.award_id']).where({
      busUserId: userId,
      taskCondition: taskCondition.id,
    });
    const lockName = `saveTaskAwardLog:${userId}:${taskCondition.id}`; //单条件并发限制
    await this.redisLock.lock(lockName, 400);
    // requestId += ':' + times;
    const totalNumberMap = {};
    if (taskCondition.sendLimit !== ConditionUnique.Normal) {
      if (taskCondition.sendLimit == ConditionUnique.Day) {
        //每天
        qb.andWhere('business_time >= :stime and business_time <= :etime', {
          stime: nowBusTime.startOf('day').toDate(),
          etime: nowBusTime.endOf('day').toDate(),
        });
      }
      if (taskCondition.sendLimit == ConditionUnique.Permanent) {
        // 永久
        qb.andWhere('business_time >= :stime and business_time <= :etime', {
          stime: taskInfo.start_time,
          etime: taskInfo.end_time,
        });
      }
      if (taskCondition.sendLimit == ConditionUnique.Week) {
        //每周
        qb.andWhere('business_time >= :stime and business_time <= :etime', {
          stime: nowBusTime.startOf('isoWeek').toDate(),
          etime: nowBusTime.endOf('isoWeek').toDate(),
        });
      }
      if (taskCondition.sendLimit == ConditionUnique.Month) {
        //每月
        qb.andWhere('business_time >= :stime and business_time <= :etime', {
          stime: nowBusTime.startOf('month').toDate(),
          etime: nowBusTime.endOf('month').toDate(),
        });
      }
      if (taskCondition.sendLimit == ConditionUnique.NWeek) {
        //每N周
        const stime = taskInfo.start_time;
        const weeks = nowBusTime.diff(moment(stime), 'weeks');
        const newStime = moment(stime)
          .add(weeks, 'week')
          .startOf('day')
          .toDate();
        const newEtime = moment(newStime)
          .add(1, 'week')
          .startOf('day')
          .toDate();
        qb.andWhere('business_time >= :stime and business_time <= :etime', {
          stime: newStime,
          etime: newEtime,
        });
      }
      if (taskCondition.sendLimit == ConditionUnique.Hour) {
        //按小时唯一
        qb.andWhere('business_time >= :stime and business_time <= :etime', {
          stime: nowBusTime.startOf('hour').toDate(),
          etime: nowBusTime.endOf('hour').toDate(),
        });
      }
      if (taskCondition.sendLimit == ConditionUnique.WeekOfMonth) {
        //按每月第几周唯一
        const beginTime = nowBusTime.clone().add(-7, 'day').endOf('day');
        const endTime = nowBusTime.clone().endOf('day');
        qb.andWhere('business_time > :stime and business_time <= :etime', {
          stime: beginTime.toDate(),
          etime: endTime.toDate(),
        });
      }
      const qbRet = await qb.getRawMany();
      const idsSet = new Set();
      //限制数量 计算每个奖励之前发的数量
      qbRet.forEach((item) => {
        if (item.award_id) {
          totalNumberMap[item.award_id] =
            (totalNumberMap[item.award_id] || 0) + item.award_number;
        }
        idsSet.add(item['t1_id']);
      });
      const userAwardCnt = idsSet.size;
      this.logger.debug({
        params: qb.getParameters(),
        len: userAwardCnt,
      });
      //限制次数
      if (
        taskCondition.limitTimes > 0 &&
        userAwardCnt > 0 &&
        userAwardCnt >= taskCondition.limitTimes
      ) {
        this.logger.log(
          `周期内已经发生奖励${userAwardCnt + ':' + taskCondition.limitTimes
          }次: req: ${requestId} ${JSON.stringify(qbRet)} ${JSON.stringify(
            qb.getParameters()
          )}`
        );
        return [];
      }
    }
    const checkAwardInfo: AwardCheckInfoEntity[] = [];
    const { mergeAwards } = await this.mergeSameResourcesAward(
      actInfo,
      taskCondition,
      userId,
      params,
      Number(times),
      Number(batches)
    );
    if (mergeAwards?.length === 0) {
      return mergeAwards;
    }
    const entity: CompleteTaskUserEntity = {
      taskInstance: { id: taskInfo.id },
      taskCondition: taskCondition,
      activity: { id: actInfo.id },
      busUserId: userId,
      // checkInfo: checkAwardInfo,
      requestId: requestId,
      targetValue: targetValue,
      times: totalTimes,
    };
    // if (busTime) {
    entity.businessTime = cloneBusTime.toJSON();
    // }
    const outPut = [];

    if (actInfo.uniqueCode.startsWith('talent_')) {
      this.logger.log(mergeAwards, 'saveTaskAwardLog');
    }
    const lastId = await this.dataSource.transaction(async (trans) => {
      const completeTask = trans.getRepository(CompleteTaskUserEntity);
      const checkAwardRep = trans.getRepository(AwardCheckInfoEntity);
      // if (result && result.id) {
      for (const award of mergeAwards) {
        // console.log(award, totalNumberMap);
        const checkEntity = new AwardCheckInfoEntity();
        checkEntity.awardInstance = award;
        // checkEntity.probLevel = probLevel;
        const preNumber = totalNumberMap[award.id] || 0;
        if (
          taskCondition.sendLimit !== ConditionUnique.Normal &&
          award.maxLimit > 0 &&
          award.number + preNumber > award.maxLimit
        ) {
          //超出奖励上限
          checkEntity.awardNumber = award.maxLimit - preNumber;
        } else {
          checkEntity.awardNumber = award.number;
        }
        checkEntity.awardDays = award.days; //换成合并后台的时效;
        checkEntity.checkStatus = taskCondition.isCheck
          ? CheckStatus.Ing
          : CheckStatus.No;
        // checkEntity.completeUser = result;
        if (checkEntity.awardNumber > 0) {
          checkAwardInfo.push(checkEntity);
          outPut.push({
            ...award,
            number: checkEntity.awardNumber,
          });
        }
      }
      if (checkAwardInfo.length > 0) {
        entity.checkInfo = checkAwardInfo;
        const result = await completeTask.save(completeTask.create(entity));
        checkAwardInfo.forEach((item) => {
          item.completeUser = result;
        });
        await checkAwardRep.save(checkAwardInfo);
        return result.id;
      } else {
        this.logger.debug('奖励数量为0');
        return 0;
      }
      // }
    });
    if (lastId == 0) {
      return [];
    }
    // this.logger.log({
    //   msg: `奖励写入完成 ${lastId}`,
    //   // taskConditon: taskConditon,
    // });
    if (lastId && !taskCondition.isAutoSend) {
      //0是自动发
      //保存成功后，且需要自动发送的奖励添加消息到队里中 ，发奖励
      const jobRet = await this.activityQueue.add(SEND_AWARD_TASKS, lastId, {
        jobId: 'send_award_' + lastId,
        delay: 1,
        attempts: 3, //完成之前尝试的次数,
        priority: lastId,
        removeOnComplete: true,
        backoff: {
          type: 'exponential',
          delay: 60 * 1000,
        },
      });
      if (!jobRet) {
        await this.awardService.sendAward(
          {
            checkId: lastId,
          },
          TaskScheduleMode.Passive
        );
      }
    }
    if (taskInfo.timing == TaskTiming.TaskFinish) {
      //任务完成调用
      const awardVal = {
        beans: 0,
        gold: 0,
        gem: 0,
      };
      outPut.forEach((item) => {
        if (item.award.keyType == 3) {
          awardVal.beans += item.number;
        }
        if (item.resourceType == 4) {
          awardVal.gold += item.number;
        }
        if (item.resourceType == 5) {
          awardVal.gem += item.number;
        }
      });
      this.utils.sendMsgNotifi(userId, taskCondition, taskInfo, awardVal);
    }
    //触发消息
    return outPut;
  }
  //批量产生奖励数据，默认为1次，
  async batchBuildAward(
    taskConditon: TaskConditionEntity,
    userId,
    batchesNumber = 1
  ): Promise<{
    totalAwards: TaskAwardInstanceEntity[];
    srcAwardMap: SrcAwardMap;
  }> {
    const awardGroupRep = this.awardGroupRepository;
    //合并一起
    const totalAwards: TaskAwardInstanceEntity[] = []; //源奖励
    //分开存储
    const srcAwardMap: SrcAwardMap = {
      // noraml: [],
      prob: [],
      // tag: [],
    };
    // 额外奖励。只针对复合标签的用户.
    const tagsUserMap = await this.getTagRuleByUser(userId); //获取用户标签
    for (let index = 0; index < batchesNumber; index++) {
      const awardsLevel = await this.utils.getAwardInstanceByProb(
        taskConditon.awardGroups,
        taskConditon
      );
      totalAwards.push(...taskConditon.awardsInstance); //直接配置的奖励
      // 概率奖励.
      for (const probLevel of awardsLevel) {
        if (probLevel.childrenAwardGroupId) {
          //子组单查
          const subGid = probLevel.childrenAwardGroupId;
          const group = await awardGroupRep.findOne({
            where: { id: subGid },
          });
          const subAwardsLevel = await this.utils.getAwardInstanceByProb(
            [group],
            taskConditon
          );
          for (const subProbLevel of subAwardsLevel) {
            const subAwardIns = subProbLevel.awardsInstance;
            totalAwards.push(...subAwardIns);
          }
        }
        const probAwards = probLevel.awardsInstance; //概率所得奖励;
        totalAwards.push(...probAwards);
        const probAwardMap: ProbMapAward = {
          probId: probLevel.id,
          awards: probAwards,
        };
        srcAwardMap.prob.push(probAwardMap);
      }
      taskConditon?.tagAwards?.forEach((_tag) => {
        const findRet = tagsUserMap.find(
          (i) => i?.tag?.id === _tag?.tagRule?.id
        );
        if (findRet) {
          totalAwards.push(..._tag.awardsInstance);
          // srcAwardMap.tag.push({
          //   tagId: _tag.id,
          //   awards: _tag.awardsInstance,
          // });
        }
      });
    }
    //统计一下每个概率档位的数量。
    return {
      totalAwards,
      srcAwardMap,
    };
  }
  /**
   *  合并同类型的奖励.
   * @param taskConditon
   * @param mergeNumber 合并次数
   * @returns 奖励实例数组
   */
  async mergeSameResourcesAward(
    actInfo,
    taskConditon: TaskConditionEntity,
    userId,
    extParams: SaveAwardDto,
    mergeNumber = 1,
    batchesNumber = 1
  ): Promise<{
    mergeAwards: TaskAwardInstanceEntity[];
    srcAwardMap: SrcAwardMap;
  }> {
    _.memoize.Cache = WeakMap;
    const memoGetAwardCat = _.memoize(this.getAwardCategory.bind(this));
    const { totalAwards, srcAwardMap } = await this.batchBuildAward(
      taskConditon,
      userId,
      batchesNumber
    ); //源奖励
    if (actInfo.uniqueCode.startsWith('talent_')) {
      this.logger.log(
        {
          mergeNumber: mergeNumber,
          batchesNumber: batchesNumber,
          totalAwards: totalAwards,
          userId: userId,
        },
        'mergeSameResourcesAward'
      );
    }
    const mergeAwards: TaskAwardInstanceEntity[] = []; //合并后的奖励
    const groupByAward = _.groupBy(totalAwards, function (ins) {
      return ins.award.id; //根据奖励Id分组.
    });
    //需要合并的资源类型;
    const keys = Object.keys(groupByAward);
    for (const _awardId of keys) {
      const groupAwardInstance = _.cloneDeep(groupByAward[_awardId]);
      //计算动态number
      for (const ins of groupAwardInstance) {
        let awardNum = ins.number;
        if (ins.award.numAttr == AwardNumberType.Dynamic && ins.formula) {
          awardNum = await this.calcAwardNumber(
            ins,
            actInfo,
            taskConditon,
            userId,
            extParams
          );
        }
        ins.number = Number(awardNum);
      }
      const category = await memoGetAwardCat({ id: _awardId });
      //按天数分组
      const groupByDays = _.groupBy(groupAwardInstance, (ins) => ins.days);
      const groupDays = Object.keys(groupByDays);
      //处理合并
      for (const someDays of groupDays) {
        //相同天在一组
        let number = 0;
        let days = 0;
        const ins = groupByDays[someDays];
        const mergeAwardInstance = _.cloneDeep(ins[0]);
        //除了Gifts分类的礼物，数量累加，有效期不累加
        if (['Gifts'].includes(category?.name)) {
          number = _.sumBy(ins, 'number') * mergeNumber;
          days = Number(someDays);
        } else {
          if (Number(someDays) > 0) {
            //合成一个，有效期累计。
            if (mergeAwardInstance.number > 0) {
              days =
                _.sumBy(ins, (_ins) => Number(someDays) * _ins.number) *
                mergeNumber;
              number = 1;
            }
          } else {
            number = _.sumBy(ins, 'number') * mergeNumber;
          }
        }
        mergeAwardInstance.number = number;
        mergeAwardInstance.days = days;
        mergeAwards.push(mergeAwardInstance);
      }
    }
    return {
      mergeAwards,
      srcAwardMap,
    };
  }
  async getAwardCategory({ id }) {
    const awardInfo = await this.awardRepository.findOne({
      where: { id },
      relations: ['category'],
      cache: true,
    });
    return awardInfo?.category;
  }
  //计算动态奖励number;
  async calcAwardNumber(
    awardInstance: TaskAwardInstanceEntity,
    actInfo: ActivityEntity,
    taskConditon: TaskConditionEntity,
    userId: string,
    extParams: SaveAwardDto
  ) {
    if (awardInstance) {
      let evalStr = '';
      const taskInfo = actInfo?.tasks?.find((i) =>
        i.taskConditions.find((j) => j.id == taskConditon.id)
      );
      for (const v of awardInstance?.formula) {
        if (typeof v != 'string' && v?.value) {
          const target = await this.businessTargeRepository.findOne({ where: { id: v.value } });
          const params = {
            activityId: actInfo.id,
            activityCode: actInfo.uniqueCode,
            indicator: v.value,
            taskId: taskInfo?.id,
            busUserId: userId,
            ...v?.paramValue,
          };
          const paramValue = v?.paramValue;
          const bindRankingId = paramValue?.['rankingRuleId'];
          if (bindRankingId) {
            const rankRule = actInfo.rankingRules.find(
              (rank) => rank.id == bindRankingId
            );
            const periodKey = this.buildPeriodKey(
              actInfo['runTime'] || Date.now(),
              rankRule?.period
            );
            if (periodKey) {
              params['periodKey'] = periodKey;
            }
          }
          if (target && target.type == TargetType.Url) {
            const result = await this.httpService
              .get(target.rule, {
                params,
              })
              .toPromise();
            evalStr += result.data.value;
            this.logger.log(params, '奖池请求参数');
          } else if (target && target.type == TargetType.Function) {
            const result = await this.funcTarget[target.rule]({
              ...params,
              extParams,
            });
            evalStr += result;
          } else if (target && target.type == TargetType.Fixed) {
            evalStr += target.rule;
          }
        } else {
          evalStr += v;
        }
      }
      const val = eval(evalStr);
      const result = val < 1 && val > 0 ? 1 : Math.floor(val);
      // const result = 1000;
      this.logger.log(
        {
          val: val,
          evalStr: evalStr,
        },
        '池子数量'
      );
      return result;
    }
    return 0;
  }
  //获取单个任务需要请求的条件
  async getCondtionMapByTask(task: ActivityTaskEntity) {
    const reqTargetMap: {
      [key: string]: {
        id: number;
        params: any;
        targetInfo?: BusinessTargetEntity;
      };
    } = {}; //请求指标map
    const totalKeysIds = [];
    for (const conditon of task.taskConditions) {
      const set = this.utils.findKeyId(conditon.conditions);
      const keyIds = Array.from(set);
      totalKeysIds.push(...keyIds);
      keyIds.forEach((key) => {
        //id + 参数 组成唯一 请求key
        const reqUniqueKey = this.utils.getConditonKey(key.id, key.params);
        reqTargetMap[reqUniqueKey] = {
          id: key.id,
          params: key.params,
        };
      });
    }
    const apiUrls = await this.bustargetRepository.find({
      where: {
        id: In(Array.from(new Set(totalKeysIds)).map((i) => i.id)),
      },
      cache: true,
    });
    Object.keys(reqTargetMap).forEach((i) => {
      const id = reqTargetMap[i].id; //指标Id
      reqTargetMap[i].targetInfo = apiUrls.find((j) => j.id == id);
    });
    // this.logger.log(reqTargetMap);
    return reqTargetMap;
  }
  buildPeriodKey(timestamp: number, type) {
    let periodKey = '';
    switch (type) {
      case RankingType.Hour:
        periodKey = moment(timestamp).add('-1', 'hour').format('YYYYMMDDHH');
        break;
      case RankingType.Week:
        periodKey = moment(timestamp).add('-1', 'w').format('gggg-w');
        break;
      case RankingType.Month:
        periodKey = moment(timestamp).add('-1', 'M').format('YYYYMM');
        break;
      case RankingType.Total:
        break;
      case RankingType.WeekOfMonth:
        const time = moment(timestamp);
        periodKey = time
          .add('-1', 'day')
          .format(`YYYY-MM-${Math.ceil(+time.format('DD') / 7)}`);
        break;
      default:
        periodKey = moment(timestamp).add('-1', 'day').format('YYYYMMDD');
        break;
    }
    return periodKey;
  }
  /**
   * 单用户是否完成任务.
   * @param activityId
   * @param taskId
   * @param userId
   * @returns
   */
  async getTargetVal(
    actInfo: ActivityEntity,
    userId: string
  ): Promise<{
    [key: number]: TaskConditionEntity[];
  }> {
    const tasks = actInfo.tasks;
    const returnData = {};
    for (const task of tasks) {
      const targetReturnData = {};
      const reqTargetMap = await this.getCondtionMapByTask(task); //请求指标map
      const params = {
        busUserId: userId,
        startTime: task.start_time,
        endTime: task.end_time,
        taskId: task.id,
        indicator: 0,
        activityId: actInfo.id,
        activityCode: actInfo?.uniqueCode,
      };
      for (const ukey of Object.keys(reqTargetMap)) {
        const reqMap = reqTargetMap[ukey];
        const confParams = reqMap.params;
        if (Array.isArray(confParams) && confParams.length > 0) {
          for (const p of confParams || []) {
            if (p.value) params[p.name] = p.value;
          }
        } else if (confParams) {
          Object.keys(confParams)?.forEach((i) => {
            if (confParams[i]) params[i] = confParams[i];
          });
        }
        const bindRankingId = params?.['rankingRuleId'];
        if (bindRankingId) {
          const rankRule = actInfo.rankingRules.find(
            (rank) => rank.id == bindRankingId
          );
          if (task.runTime) {
            const periodKey = this.buildPeriodKey(
              task.runTime,
              rankRule?.period
            );
            if (periodKey) {
              params['periodKey'] = periodKey;
            }
          }
        }
        let respData;
        const v = reqMap.targetInfo;
        if (v.type == TargetType.Lambda) {
          params.indicator = v.id;
          respData = await this.callLambdaFunction(v.rule, params);
        } else if (v.type == TargetType.Url && v.rule) {
          params.indicator = v.id as number;
          const resp = await this.httpService
            .get(v.rule, {
              params,
              data: params,
            })
            .toPromise();
          respData = resp.data;
        } else if (v.type == TargetType.Fixed && v.rule) {
          respData = { value: v.rule };
        }
        if (respData) {
          targetReturnData[ukey] = respData.value;
        }
      }
      //过滤当前条件中完成的
      task.taskConditions.forEach((cond) => {
        const currentCondDataMap = {};
        const set = this.utils.findKeyId(cond.conditions);
        const keyIds = Array.from(set);
        keyIds.forEach((key) => {
          //id + 参数 组成唯一 请求key
          const reqUniqueKey = this.utils.getConditonKey(key.id, key.params);
          currentCondDataMap[reqUniqueKey] = targetReturnData[reqUniqueKey];
        });
        const divWhere = this.utils.parseConditionDivInt(
          cond.conditions,
          'item.'
        );
        if (divWhere) {
          // 上、下取整 条件
          const evalStr = `const item = ${JSON.stringify(
            currentCondDataMap
          )};${divWhere}`;
          const times = eval(evalStr) || 0;
          cond['times'] = times;
        } else {
          const condtionWhere = this.utils.parseCondition(
            cond.conditions,
            'obj.'
          );
          const evalStr = `const obj=${JSON.stringify(
            currentCondDataMap
          )};${condtionWhere}`;
          this.logger.log(`call target eval: ${evalStr}`);
          cond.isComplete = eval(evalStr);
        }
        const objSize = _.size(currentCondDataMap);
        let conditonValue = 0;
        if (objSize === 1) {
          conditonValue = Object.values<number>(currentCondDataMap)[0];
        }
        cond['value'] = conditonValue;
      });
      returnData[task.id] = task.taskConditions;
    }
    return returnData;
  }
  //统计单个任务完成的所有用户
  async getTaskCompleteUsers(task: ActivityTaskEntity) {
    const actInfo = await this.getInfo(task.activity.uniqueCode);
    const reqTargetMap = await this.getCondtionMapByTask(task);
    const params = {
      startTime: task.start_time,
      endTime: task.end_time,
      indicator: 0,
      activityId: task.activityId,
      activityCode: task?.activity?.uniqueCode,
      taskId: task.id,
    };
    const totalData = [];
    const hasMap = {};
    for (const ukey of Object.keys(reqTargetMap)) {
      const reqMap = reqTargetMap[ukey];
      const confParams = reqMap.params;
      const v = reqMap.targetInfo;
      params.indicator = v.id as number;
      if (Array.isArray(confParams) && confParams.length > 0) {
        for (const p of confParams || []) {
          if (p.value) params[p.name] = p.value;
        }
      } else if (confParams) {
        Object.keys(confParams)?.forEach((i) => {
          if (confParams[i]) params[i] = confParams[i];
        });
      }
      const bindRankingId = params['rankingRuleId'];
      if (bindRankingId) {
        const rankRule = actInfo.rankingRules.find(
          (rank) => rank.id == bindRankingId
        );
        if (task.runTime) {
          const periodKey = this.buildPeriodKey(task.runTime, rankRule?.period);
          if (periodKey) {
            params['periodKey'] = periodKey;
          }
        }
      }
      let respData;
      if (v.rule && v.type == TargetType.Lambda) {
        respData = await this.callLambdaFunction(v.rule, params);
      } else if (v.rule && v.type == TargetType.Url) {
        this.logger.log({
          'req params': params,
          rule: v.rule,
        });
        const resp = await this.httpService
          .get(v.rule, {
            params,
            data: params,
          })
          .toPromise();
        respData = resp.data;
        this.logger.debug(respData, 'resp data');
      } else if (v.rule && v.type == TargetType.Fixed) {
        try {
          respData = JSON.parse(v.rule);
        } catch (error) { }
      }
      if (respData) {
        //合并相同的用户的多个指标值。到一个对象。
        const respArr = respData?.all || [];
        const userKey = 'busUserId';
        const key = `key_id_${v.id}`; //指标key
        // const uniqueKey = `${userKey}_${key}`;
        for (const [index, item] of respArr.entries()) {
          // if (hasMap[uniqueKey]) {
          //   //合并
          //   const saveIndex = totalData.findIndex(
          //     (i) => i[userKey] === hasMap[item[userKey]]
          //   );
          //   totalData[saveIndex] = {
          //     ...totalData[saveIndex],
          //     ...item,
          //     [ukey]: item[key] ?? item?.value ?? index + 1,
          //   };
          // } else {
          // }
          // hasMap[uniqueKey] = item[userKey];
          totalData.push({
            ...item,
            [ukey]: item[key] ?? item?.value ?? index + 1,
          });
        }
      }
    }
    this.logger.log({
      totalData,
    });
    for (const cond of task.taskConditions) {
      const currentData = [];
      const set = this.utils.findKeyId(cond.conditions);
      const keyIds = Array.from(set);
      const keysUnqiue = new Set<string>();
      keyIds.forEach((key) => {
        //id + 参数 组成唯一 请求key
        const reqUniqueKey = this.utils.getConditonKey(key.id, key.params);
        keysUnqiue.add(reqUniqueKey);
      });
      // this.logger.log(keysUnqiue, 'keysUnqiue');
      //遍历 keysUnqiue
      for (const reqUniqueKey of keysUnqiue) {
        currentData.push(
          ...totalData.filter((i) => i[reqUniqueKey] !== undefined)
        );
      }
      const divIntWhere = this.utils.parseConditionDivInt(
        cond.conditions,
        'item.'
      );
      const condtionWhere = this.utils.parseCondition(cond.conditions, 'item.');
      let evalStr = '';
      if (divIntWhere) {
        evalStr = `const arr=${JSON.stringify(
          currentData
        )};arr.map(item => ({times: ${divIntWhere}, ...item})).filter(i => i.times > 0)`;
        const result = eval(evalStr);
        cond['times'] = result;
      } else {
        evalStr = `const arr=${JSON.stringify(
          currentData
        )};arr.filter(item => ${condtionWhere})`;
        const result = eval(evalStr);
        // const userId = result.map((u) => u?.userId);
        // cond.completeUserIds = userId;
        cond['notimes'] = result;
      }
      this.logger.log({
        evalStr,
        reuslt: cond['notimes'] || cond['times'],
      });
    }
    return task.taskConditions;
  }
  /*被动获取活动完成用户*/
  async getActivityCompleteUser(activityId) {
    return await this.completeTaskRepository.find({
      where: {
        activity: activityId,
      },
      select: ['busUserId', 'create_at', 'completeCount'],
    });
  }
  //被动完成插入的用户.
  async getCompleteAndInster(
    task: ActivityTaskEntity,
    actInfo: ActivityEntity
  ) {
    const completeUsers: CompleteTaskUserEntity[] = [];
    const taskCondition = await this.getTaskCompleteUsers(task);
    if (!task?.task?.id) {
      throw new Error('未关联原始任务');
    }
    for (const cond of taskCondition) {
      const scheduleMode =
        cond?.customParam?.scheduleMode ?? task?.task?.scheduleMode;
      if (scheduleMode != TaskScheduleMode.Passive) {
        continue;
      }
      // this.logger.log(cond, 'getCompleteAndInster');
      let timeUnique = '';
      if (cond.limitTimes == 1 && cond.sendLimit != ConditionUnique.Normal) {
        const runTime = task.runTime ?? actInfo['runTime'] ?? moment();
        const curTime = moment(runTime);
        switch (cond.sendLimit) {
          case ConditionUnique.Day:
            timeUnique = curTime.format('YYYYMMDD');
            break;
          case ConditionUnique.Hour:
            timeUnique = curTime.format('YYYYMMDDHH');
            break;
          case ConditionUnique.Week:
          case ConditionUnique.NWeek:
            timeUnique = curTime.format('gggg-ww');
            break;
          case ConditionUnique.Month:
            timeUnique = curTime.format('YYYYMM');
            break;
          case ConditionUnique.Permanent:
            timeUnique = moment(actInfo.end_time).format('YYYYMMDDHHmmss');
            break;
          case ConditionUnique.WeekOfMonth:
            timeUnique = curTime
              .add('-1', 'day')
              .format(`YYYY-MM-${Math.ceil(+curTime.format('DD') / 7)}`);
            break;
        }
      }
      if (cond['times']) {
        //特殊条件。
        for (const item of cond['times']) {
          const nowTimes = item.times;
          if (nowTimes > 0) {
            const preTimes =
              (await this.utils.getTimesCache<number>(
                item.busUserId,
                cond.id
              )) || 0;
            const diffTimes = nowTimes - preTimes;
            diffTimes > 0 &&
              (await this.saveTaskAwardLog({
                taskCondition: cond,
                // activityId: task.activityId,
                requestId: timeUnique
                  ? `${actInfo.uniqueCode}:${task.id}:${item.busUserId}:${timeUnique}:diff:${diffTimes}`
                  : null,
                actInfo,
                userId: item.busUserId,
                taskInfo: task,
                times: diffTimes,
                totalTimes: nowTimes,
                targetValue: item.value,
              }));
            await this.utils.setTimesCache(
              item.busUserId,
              cond.id,
              nowTimes,
              0
            );
            completeUsers.push(item);
          }
        }
      } else if (cond['notimes']) {
        //普通条件。
        for (const item of cond['notimes']) {
          await this.saveTaskAwardLog({
            requestId: timeUnique
              ? `${actInfo.uniqueCode}:${task.id}:${item.busUserId}:${timeUnique}`
              : null,
            taskCondition: cond,
            actInfo,
            userId: item.busUserId,
            taskInfo: task,
            targetValue: item.value,
          });
          completeUsers.push(item);
        }
      }
    }
    return completeUsers;
  }
  async getActivityAwardList(dto: BaseTableListParams) {
    dto['issue'] = 1;
    return this.awardService.getCheckAwardList(dto);
  }
  async callTarget(activityId, apiUrl, userId = '', ext = '') {
    const activityInfo = await this.getInfo(activityId);
    const targetInfo = await this.bustargetRepository.findOne({
      where: [
        {
          rule: apiUrl,
        },
      ],
    });
    if (!targetInfo || !activityInfo) {
      throw new MyHttpException({
        statusCode: ErrorCode.NotTargetNotFound.CODE,
      });
    }
    const params = {
      userId,
      startTime: activityInfo.start_time,
      endTime: activityInfo.end_time,
      keyId: targetInfo.id,
      activityId,
      activityName: activityInfo.name,
      ext: ext,
    };
    if (targetInfo.rule && targetInfo.type == TargetType.Lambda) {
      return await this.callLambdaFunction(targetInfo.rule, params);
    } else if (targetInfo.rule && targetInfo.type == TargetType.Url) {
      const resp = await this.httpService
        .get(targetInfo.rule, {
          params,
          data: params,
        })
        .toPromise();
      return resp.data;
    }
  }
  //调用lambda函数。
  async callLambdaFunction(functionName, params) {
    const { aws_region, aws_accessKeyId, aws_secretAccessKey } = process.env;
    const lambda = new AWS.Lambda({
      region: aws_region,
      accessKeyId: aws_accessKeyId,
      secretAccessKey: aws_secretAccessKey,
    });
    const invoke = util.promisify(lambda.invoke.bind(lambda));
    const result = await invoke({
      FunctionName: functionName,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({
        queryStringParameters: params,
      }),
    });
    const payload = JSON.parse(result.Payload.toString());
    return JSON.parse(payload.body);
  }
  //获取任务完成次数
  async getTask(where) {
    // this.completeTaskRepository.find();
  }
  async getInfoByCode(code) {
    return await this.activityRepository.findOne({
      cache: true,
      where: {
        uniqueCode: code,
      },
    });
  }
  //根据业务用户获取tag
  async getTagRuleByUser(businessUserId): Promise<UserTagEntity[]> {
    const repo = this.dataSource.getRepository(UserTagEntity);
    const outPut = await this.cacheManager.wrap<UserTagEntity[]>(
      this.utils.getUserTagMapKey(businessUserId),
      async () => {
        return repo.find({
          relations: ['tag', 'user'],
          where: {
            // startTime: LessThanOrEqual(new Date()),
            endTime: MoreThan(new Date()),
            isDel: false,
            user: {
              isDel: false,
              businessUserId,
            },
          },
        });
      },
      {
        ttl: (result) => {
          if (result.length == 0) {
            return 10;
          }
          return 5 * 60;
        },
      }
    );
    //q: 由于有5分钟缓存，所以这里需要过滤掉未开始和已经结束的数据。
    return outPut?.filter(
      (i) =>
        moment(i.startTime).isSameOrBefore(moment()) &&
        moment(i.endTime).isSameOrAfter(moment())
    );
  }
  //检查用户的tag是否存在
  async checkTag(
    activityInfo: ActivityEntity,
    tagRules: TagRuleEntity[],
    businessUserId
  ): Promise<boolean> {
    if (activityInfo?.custom_param?.partialDone == 1) {
      //部分完成
      const repo = this.dataSource.getRepository(CompleteTaskUserEntity);
      const hasAward = await repo.findOne({
        where: {
          activity: { id: activityInfo.id },
          busUserId: businessUserId,
        },
      });
      if (hasAward) {
        return true;
      }
    }
    const tagMaps = await this.getTagRuleByUser(businessUserId);
    let flag = true;
    if (tagRules?.length > 0) {
      flag = false;
      for (const tagRule of tagRules) {
        const findRet = tagMaps.find((i) => i?.tag?.id === tagRule.id);
        if (findRet) {
          flag = true;
          break;
        }
      }
    }
    return flag;
  }
  async getBusUserResource(busUserId: string, actInfo: ActivityEntity, types) {
    const stime = Number(moment(actInfo.start_time).format('x'));
    const etime = Number(moment(actInfo.end_time).format('x'));
    return this.dataSource
      .getRepository(UserResouceEntity)
      .find({
        cache: true,
        select: ['amount', 'type'],
        where: {
          busUserId,
          activity: { id: actInfo.id },
          lastTime: Between(stime, etime),
          type: In(types),
        },
      });
  }
  async asyncDataToRedis() {
    //
  }
  //批量修改一个活动下任务条件 奖励是否需要审核。
  async updateTaskConditionCheckStatus(
    actInfo: ActivityEntity,
    isCheck: boolean
  ) {
    const condIds = [];
    for (const task of actInfo.tasks) {
      for (const cond of task.taskConditions) {
        condIds.push(cond.id);
      }
    }
    const qb = this.dataSource.getRepository(TaskConditionEntity);
    const ret = await qb.find({
      where: {
        id: In(condIds),
        isCheck: !isCheck,
      },
    });
    for (const item of ret) {
      qb.update(
        {
          version: item.version,
          id: In(condIds),
        },
        {
          isCheck,
        }
      );
    }
  }
  async getActivityInfo(id: string) {
    const manager = this.dataSource.manager;
    const info = await this.activityRepository
      .createQueryBuilder('act')
      .leftJoinAndSelect('act.ruleConfig', 'rconfig')
      .leftJoinAndSelect('act.rankingRules', 'ranking')
      .leftJoinAndSelect('act.tagConfig', 'tagConfig')
      // .leftJoinAndSelect('act.tasks', 'tasks')
      // .leftJoinAndSelect('tasks.task', 'task')
      // .leftJoinAndSelect('tasks.tagConfig', 'tagConfig')
      // .leftJoinAndSelect('tasks.taskConditions', 'conditions')
      // .leftJoinAndSelect('conditions.awardsInstance', 'awardsInstance')
      // .leftJoinAndSelect('awardsInstance.award', 'award')
      .where('act.id = :id', { id })
      .orWhere('act.unique_code = :code', { code: id })
      .getOne();
    if (!info) return {};
    const tasks = await manager
      .getRepository(ActivityTaskEntity)
      .createQueryBuilder('tasks')
      .leftJoinAndSelect('tasks.tagConfig', 'tagConfig')
      .leftJoinAndSelect('tasks.task', 'task')
      .where('tasks.activity_id = :actId', { actId: info.id })
      .getMany();
    if (tasks.length > 0) {
      const conditons = await manager
        .getRepository(TaskConditionEntity)
        .createQueryBuilder('con')
        .leftJoinAndSelect('con.awardsInstance', 'awardsInstance')
        .leftJoinAndSelect('awardsInstance.award', 'award')
        .leftJoinAndSelect('con.awardGroups', 'awardGroups')
        .leftJoinAndSelect('awardGroups.probLevelAwards', 'prob')
        .leftJoinAndSelect('prob.awardsInstance', 'probAwardIns')
        .leftJoinAndSelect('probAwardIns.award', 'probSrcAward')
        .leftJoinAndSelect('con.tagAwards', 'tagAwards')
        .leftJoinAndSelect('tagAwards.tagRule', 'tagRule')
        .leftJoinAndSelect('tagAwards.awardsInstance', '_ruleInsAward')
        .leftJoinAndSelect('_ruleInsAward.award', '_ruleAward')
        .where('con.instance_task_id IN (:...taskIds)', {
          taskIds: tasks?.map((i) => i.id),
        })
        .getMany();
      const groupConditon = _.groupBy(conditons, 'instanceTaskId');
      tasks.forEach((task) => {
        task.taskConditions = groupConditon[task.id];
      });
      info.tasks = tasks;
    }
    return info;
  }
  // 同步活动榜单的参数ID
  async syncActivityRankingIdToParams(id: number) {
    const syncField = ['rankingRuleId'];
    const actInfo = await this.activityRepository.findOne({ where: { id } });
    const getRankingMapId = async (rankingId) => {
      const rankInfo = await this.dataSource
        .getRepository(RankingRuleEntity)
        .findOne({ where: { id: rankingId } });
      if (rankInfo) {
        const findRankInfo = actInfo.rankingRules.find(
          (i) => i.name === rankInfo.name
        );
        if (findRankInfo && findRankInfo.id != rankingId) {
          return findRankInfo.id;
        }
      }
    };
    const syncAwardInsFunc = async (awardIns) => {
      for (const aIns of awardIns) {
        if (aIns.formula) {
          for (const i of aIns.formula) {
            if (typeof i === 'object' && i.paramValue) {
              const keys = Object.keys(i.paramValue);
              for (const key of keys) {
                if (syncField.includes(key)) {
                  const respId = await getRankingMapId(i.paramValue[key]);
                  if (respId) {
                    console.log(
                      'award before...',
                      JSON.stringify(aIns.formula)
                    );
                    i.paramValue[key] = respId;
                    console.log('award after...', JSON.stringify(aIns.formula));
                    //更新到数据库
                    await this.dataSource
                      .getRepository(TaskAwardInstanceEntity)
                      .update(
                        {
                          id: aIns.id,
                        },
                        {
                          formula: aIns.formula,
                        }
                      );
                  }
                }
              }
            }
          }
        }
      }
    };
    if (actInfo) {
      for (const task of actInfo.tasks) {
        for (const cond of task.taskConditions) {
          //同步任务条件中的公式参数
          for (const i of cond.conditions as any) {
            if (typeof i === 'object' && i.params) {
              const keys = Object.keys(i.params);
              for (const key of keys) {
                if (syncField.includes(key)) {
                  const respId = await getRankingMapId(i.params[key]);
                  if (respId) {
                    console.log(
                      'condition before...',
                      JSON.stringify(cond.conditions)
                    );
                    i.params[key] = respId;
                    console.log(
                      'conditon after...',
                      JSON.stringify(cond.conditions)
                    );
                    //更新到数据库
                    await this.dataSource
                      .getRepository(TaskConditionEntity)
                      .update(
                        {
                          id: cond.id,
                        },
                        {
                          conditions: cond.conditions,
                        }
                      );
                  }
                }
              }
            }
          }
          //同步奖励中的公式参数
          await syncAwardInsFunc(cond.awardsInstance);
          for (const awardGroup of cond.awardGroups) {
            for (const probLevelAward of awardGroup.probLevelAwards) {
              await syncAwardInsFunc(probLevelAward.awardsInstance);
            }
          }
          for (const tagAward of cond.tagAwards) {
            await syncAwardInsFunc(tagAward.awardsInstance);
          }
        }
      }
    }
  }

  async saveActivityTask(dto: ActivityTaskDto) {
    const task = this.activityTaskRepository.create(dto);
    // console.log(task);
    return this.activityTaskRepository.save(task);
  }

  async test() {
    // const data = await this.getInfo('battle_20240813_ts');
    // const jobId1 = 'act:1';
    // const jobId2 = 'act:2';
    // this.activityQueue.add('checkActivityTaskComplete', data, {
    //   jobId: jobId1,
    //   delay: 10,
    //   attempts: 3,
    //   removeOnComplete: true,
    //   backoff: {
    //     type: 'exponential',
    //     delay: 60 * 1000,
    //   },
    // });
    // this.activityQueue.add('checkActivityTaskComplete', data, {
    //   jobId: jobId2,
    //   delay: 10,
    //   attempts: 3,
    //   removeOnComplete: true,
    //   backoff: {
    //     type: 'exponential',
    //     delay: 60 * 1000,
    //   },
    // });
  }
}
