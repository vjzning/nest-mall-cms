import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Code, In, MoreThan, UpdateResult, Raw, DataSource } from 'typeorm';
import { RawSqlResultsToEntityTransformer } from 'typeorm/query-builder/transformer/RawSqlResultsToEntityTransformer';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorCode } from 'apps/sem-api/src/common/constants/error';
import { BaseTableListParams } from 'apps/sem-api/src/common/dto/index';
import {
  AwardSendStatus,
  CheckStatus,
  ConditionUnique,
  ResourceType,
  SwitchStatus,
  TargetType,
  TaskScheduleMode,
  TaskTiming,
  YesOrNo,
} from 'apps/sem-api/src/common/enum';
import { MyHttpException } from 'apps/sem-api/src/common/exception/my.http.exception';
import { Utils } from 'apps/sem-api/src/common/utils/utils';
import { AwardCheckInfoEntity } from 'apps/sem-api/src/entity/award.check';
import { AwardEntity } from 'apps/sem-api/src/entity/award.entity';
import { BusinessTargetEntity } from 'apps/sem-api/src/entity/business.arget.entity';
import { CategoryAwardEntity } from 'apps/sem-api/src/entity/category.award.entity';
import { CompleteTaskUserEntity } from 'apps/sem-api/src/entity/complete.task.user.entity';
import { LessThan, Like, Not, Repository } from 'typeorm';
import { QueryId, UpdateStatus } from '../account/dto';
import { SaveCategoryDto } from '../task/dto';
import AxiosRetry from 'axios-retry';
import xlsx from 'node-xlsx';
import * as ExcelJS from 'exceljs';
import { Decimal } from 'decimal.js';
import {
  AwardItemDto,
  AwardResourceDto,
  CheckAwardDto,
  CreateAwardDto,
  MappNameToIdDto,
  RewardDto,
  SendAwardDto,
  SendResourceDto,
} from './dto';
import { Cron } from '@nestjs/schedule';
import { RedisLockService } from '@app/sem-api/modules/redisLock/redisLock.service';
import * as moment from 'moment';
import * as _ from 'lodash';

import { TaskAwardInstanceEntity } from 'apps/sem-api/src/entity/activities.task.award';
import { TaskConditionEntity } from 'apps/sem-api/src/entity/task.condition.entity';
import { ModuleRef } from '@nestjs/core';
import type { ActivityService } from '../activity/activity.service';
import { Cache } from 'cache-manager';
import {
  WarningNoticeEntity,
  WarningNotifyStatus,
} from 'apps/sem-api/src/entity/warning.notice.entity';
import { WarningNoticeService } from '../warning/notice';
import { SysConfigEntity } from 'apps/sem-api/src/entity/system.config.entity';
import { ActivityEntity } from 'apps/sem-api/src/entity/activities.entity';
import { TaskEntity } from 'apps/sem-api/src/entity/task.entity';
import { AwardGroupEntity } from 'apps/sem-api/src/entity/award.group.entity';
import { RuleConfigEntity } from 'apps/sem-api/src/entity/rule.config.entity';
import { TagRuleEntity } from 'apps/sem-api/src/entity/tag.rule.entity';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
@Injectable()
export class AwardService {
  private readonly logger = new Logger(AwardService.name);
  constructor(
    private readonly warnServer: WarningNoticeService,
    private utils: Utils,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,

    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
    @InjectRepository(CategoryAwardEntity)
    private readonly categoryRepository: Repository<CategoryAwardEntity>,
    @InjectRepository(AwardEntity)
    private readonly awardRepository: Repository<AwardEntity>,
    @InjectRepository(AwardCheckInfoEntity)
    private readonly awardCheckRepository: Repository<AwardCheckInfoEntity>,
    @InjectRepository(CompleteTaskUserEntity)
    private readonly completeTaskRepository: Repository<CompleteTaskUserEntity>,

    @InjectRepository(TaskConditionEntity)
    private readonly taskConditonRepository: Repository<TaskConditionEntity>,

    @InjectRepository(SysConfigEntity)
    private readonly sysconfigRepository: Repository<SysConfigEntity>,
    private readonly redisLock: RedisLockService,
    private moduleRef: ModuleRef,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
    private dataSource: DataSource
  ) {
    AxiosRetry(this.httpService.axiosRef, {
      retries: 3,
    });
  }
  async getTaskCategory(dto: BaseTableListParams) {
    const where = {};
    if (dto.name) {
      where['name'] = Like(`%${dto.name}%`);
    }
    if (dto?.keyword) {
      where['name'] = Like(`%${dto.keyword}%`);
    }
    const ret = await this.categoryRepository.find(where);
    return ret;
  }
  async saveCategory(dto: SaveCategoryDto) {
    if (dto.batch && dto.batch.length > 0) {
      await this.categoryRepository.save(dto.batch);
    } else {
      await this.categoryRepository.save(dto);
    }
    return true;
  }
  async deleteCategory(dto: QueryId) {
    return this.categoryRepository.delete(dto.id);
  }
  async getAwardList(dto: BaseTableListParams) {
    const where = {};
    if (dto.name) {
      where['name'] = Like(`%${dto.name}%`);
    }
    if (dto?.keyword) {
      where['name'] = Like(`%${dto.keyword}%`);
    }
    if (dto['resourceType']) {
      where['type'] = dto['resourceType'];
    }
    if (dto['keyId']) {
      where['keyId'] = dto['keyId'];
    }
    if (dto['keyType']) {
      where['keyType'] = dto['keyType'];
    }
    if (dto['costType']) {
      where['costType'] = dto['costType'];
    }
    const qb = this.awardRepository
      .createQueryBuilder('award')
      .leftJoinAndSelect('award.category', 'category')
      .where(where)
      .skip((dto.current - 1) * dto.pageSize)
      .take(dto.pageSize)
      .orderBy('award.id', 'DESC');
    const [list, count] = await qb.getManyAndCount();
    return {
      list,
      count,
      page: dto.current,
      pageSize: dto.pageSize,
    };
  }
  async createAward(dto: CreateAwardDto) {
    const info = this.awardRepository.create(dto);
    return this.awardRepository.save(info);
  }
  async updateStatus(dto: UpdateStatus) {
    return await this.awardRepository.update(dto.id, {
      status: dto.status,
    });
  }
  async deleteAward(dto: QueryId) {
    return this.awardRepository.delete(dto.id);
  }
  async getCheckAwardQueryBuild(dto: BaseTableListParams) {
    // console.log(dto);
    const build = this.completeTaskRepository
      .createQueryBuilder('t1')
      .leftJoinAndSelect('t1.taskInstance', 'taskInstance')
      // .leftJoinAndSelect('taskInstance.task', 'task')
      .leftJoinAndSelect('t1.checkInfo', 'checkInfo')
      .leftJoinAndSelect('t1.activity', 'activity')
      .leftJoinAndSelect('checkInfo.awardInstance', 'awardIns')
      .leftJoinAndSelect('awardIns.award', 'srcaward')
      .skip(((dto.current ?? 1) - 1) * (dto.pageSize ?? 20))
      .take(dto.pageSize ?? 20)
      .orderBy('t1.id', 'DESC');
    // .addOrderBy('t1.issue', 'ASC');
    build.andWhere('t1.is_del = :isDel', {
      isDel: false,
    });
    build.andWhere('activity.act_type = :actType', {
      actType: dto['actType'] || 1,
    });
    if (dto?.keyword) {
      const keyword = dto?.keyword?.trim();
      build.andWhere(
        '(t1.bus_user_id = :userId or t1.request_id = :requestId  or taskInstance.alias_name like :alias_name or srcaward.name like :award_name or activity.name like :activity_name)',
        {
          alias_name: `%${keyword}%`,
          award_name: `%${keyword}%`,
          activity_name: `%${keyword}%`,
          requestId: `${keyword}`,
          userId: dto.keyword,
        }
      );
    }
    if (dto?.create_at?.length == 2) {
      build.andWhere('t1.create_at >= :stime and t1.create_at <= :etime', {
        stime: dto.create_at[0],
        etime: dto.create_at[1],
      });
    }
    if ([1, 2, 3].indexOf(parseInt(dto['issue'])) !== -1) {
      build.andWhere('t1.is_sue = :isSue', {
        isSue: dto['issue'],
      });
    }
    if (dto['activityId']) {
      build.andWhere('t1.activity = :activity', {
        activity: dto['activityId'],
      });
    }
    if (dto['taskId']) {
      build.andWhere('t1.taskInstance = :taskId', {
        taskId: dto['taskId'],
      });
    }
    if (dto['noCheck'] == 1) {
      build.andWhere('checkInfo.check_status = :pendingStatus', {
        pendingStatus: CheckStatus.Ing,
      });
    }
    // console.log(build.getSql());
    return build;
  }
  async getCheckAwardList(dto: BaseTableListParams) {
    const build = await this.getCheckAwardQueryBuild(dto);
    const [list, count] = await build.getManyAndCount();
    return {
      list,
      count,
      page: dto.current,
      pageSize: dto.pageSize,
    };
  }
  // 获取奖励审核列表，性能优化版本
  async getCheckAwardList2(dto: BaseTableListParams) {
    const qba = this.activityRepository
      .createQueryBuilder('t1')
      .select('t1.id')
      .addSelect('t1.act_type')
      .addSelect('t1.name')
      .addSelect('t1.uniqueCode')
      .cache(true)
      .where('t1.act_type = :actType', {
        actType: dto['actType'] || 1,
      });
    if (dto['activityId']) {
      qba.andWhere('t1.id = :activityId', {
        activityId: dto['activityId'],
      });
    }
    const activies = await qba.getMany();

    const activiesMap: {
      [key: number]: ActivityEntity;
    } = {};
    activies.forEach((i: any) => {
      activiesMap[i.id] = i;
    });
    if (!activies || activies.length == 0) {
      return {
        list: [],
        count: 0,
        page: dto.current,
        pageSize: dto.pageSize,
      };
    }
    const build = this.completeTaskRepository
      .createQueryBuilder('t1')
      // .select('t1.id')
      .skip(((dto.current ?? 1) - 1) * (dto.pageSize ?? 20))
      .take(dto.pageSize ?? 20)
      .orderBy('t1.id', 'DESC');
    // .addOrderBy('t1.issue', 'ASC');
    build.andWhere('t1.is_del = :isDel', {
      isDel: false,
    });
    build.andWhere('t1.activity in (:...activity)', {
      activity: activies?.map((item) => item.id),
    });
    if (dto['taskId']) {
      build.andWhere('t1.task_id = :taskId', {
        taskId: dto['taskId'],
      });
    }
    if (dto?.keyword) {
      const keyword = dto?.keyword?.trim();
      build.andWhere(
        '(t1.bus_user_id = :userId or t1.request_id = :requestId)',
        {
          // alias_name: `%${keyword}%`,
          // award_name: `%${keyword}%`,
          // activity_name: `%${keyword}%`,
          requestId: `${keyword}`,
          userId: dto.keyword,
        }
      );
    }
    if (dto?.create_at?.length == 2) {
      build.andWhere('t1.create_at >= :stime and t1.create_at <= :etime', {
        stime: dto.create_at[0],
        etime: dto.create_at[1],
      });
    }
    if ([1, 2, 3].indexOf(parseInt(dto['issue'])) !== -1) {
      build.andWhere('t1.is_sue = :isSue', {
        isSue: dto['issue'],
      });
    }
    if (dto['noCheck'] == 1) {
      // 使用 JOIN 替代子查询
      build.innerJoin(
        (subQuery) => {
          return subQuery
            .select('DISTINCT ac.complete_id', 'complete_id')
            .from(AwardCheckInfoEntity, 'ac')
            .where('ac.check_status = :pendingStatus', {
              pendingStatus: CheckStatus.Ing,
            });
        },
        'unchecked',
        'unchecked.complete_id = t1.id'
      );
    }
    // const [list, count] = await build.getManyAndCount();
    // const count = await build.getCount();
    // console.log(build.getSql());
    const list = await build.getMany();
    let total = 0;
    try {
      const tableInfo = await this.dataSource.query(
        `show table status like '%complate_task_user'`
      );
      // console.log(tableInfo);
      total = tableInfo?.[0]?.['Rows'];
    } catch (error) { }
    // console.log(build.getSql());
    // list.entities
    // console.log(activiesMap);
    return {
      list: list.map((i) => ({
        ...i,
        uniqueCode: activiesMap[i.activityId]?.uniqueCode,
      })),
      count: total,
      page: dto.current,
      pageSize: dto.pageSize,
    };
  }
  async getCheckAwardInfo(id) {
    const info = await this.completeTaskRepository
      .createQueryBuilder('t1')
      .leftJoinAndSelect('t1.taskInstance', 'taskInstance')
      .leftJoinAndSelect('t1.taskCondition', 'conditon')
      .leftJoinAndSelect('t1.checkInfo', 'checkInfo')
      .leftJoinAndSelect('t1.activity', 'activity')
      .leftJoinAndSelect('checkInfo.awardInstance', 'awardIns')
      .leftJoinAndSelect('awardIns.award', 'srcaward')
      .where({ id })
      .cache(true)
      .getOne();
    return info;
  }
  async saveAwardCheck(dto) {
    return this.awardCheckRepository.save(dto);
  }

  async seveCompleteTask(dto) {
    return this.completeTaskRepository.save(dto);
  }
  async checkAward(dto: CheckAwardDto, user) {
    return this.awardCheckRepository.update(
      {
        id: dto.id as number,
      },
      {
        checkStatus: dto.status,
        checkUser: user,
        checkDesc: dto.desc,
      }
    );
  }
  //批量审核
  async bulkCheckAward(dto: CheckAwardDto, user) {
    return this.awardCheckRepository.update(
      {
        completeUser: {
          id: In(dto.id as []),
        },
      },
      {
        checkStatus: dto.status,
        checkUser: user,
        checkDesc: dto.desc,
      }
    );
  }
  //根据条件和用户无需审核的奖励.
  async sendAwardByConditon(qs) {
    const { conditionId, busUserId, period } = qs;
    const conditionIds = [];
    if (!Array.isArray(conditionId)) {
      conditionIds.push(...conditionId.split(','));
    } else {
      conditionIds.push(...conditionId);
    }
    // console.log(conditionIds);
    const conditon = await this.taskConditonRepository.findOne({
      where: { id: conditionIds[0] },
    });
    if (!conditon) {
      throw new MyHttpException({
        statusCode: ErrorCode.NotCondition.CODE,
      });
    }
    const qb = this.completeTaskRepository
      .createQueryBuilder('t1')
      .leftJoinAndSelect('t1.taskInstance', 'taskInstance')
      .leftJoinAndSelect('t1.taskCondition', 'taskConditon')
      .leftJoinAndSelect('t1.checkInfo', 'checkInfo')
      .leftJoinAndSelect('t1.activity', 'activity')
      .leftJoinAndSelect('checkInfo.awardInstance', 'awardIns')
      .leftJoinAndSelect('awardIns.award', 'srcaward')
      .where(
        't1.bus_user_id = :busUserId and t1.task_condition_id IN (:...condIds)',
        { busUserId, condIds: conditionIds }
      )
      .andWhere(
        'checkInfo.is_sue = :isSue and checkInfo.check_status = :checkStatus',
        {
          isSue: YesOrNo.No,
          checkStatus: CheckStatus.No,
        }
      );
    // console.log(qb.getSql());
    if (conditon.sendLimit == ConditionUnique.Day) {
      let nowTime = moment();
      if (period) {
        nowTime = moment(period);
      }
      qb.andWhere('t1.create_at >= :stime and t1.create_at <= :etime', {
        stime: nowTime.startOf('day').toDate(),
        etime: nowTime.endOf('day').toDate(),
      });
    }
    const result = await qb.getMany();
    // const sql = qb.getSql();
    // console.log(result.length, result, sql);
    if (result.length == 0) {
      throw new MyHttpException({
        statusCode: ErrorCode.NotAwarDNotSend.CODE,
      });
    }
    this.logger.log(`result:${JSON.stringify(result)}`, 'sendAwardByConditon');
    const awardItem: AwardItemDto[] = [];
    const giftAwardDto: SendAwardDto = {
      requestId: result[0].requestId,
      items: awardItem,
      userId: busUserId,
      activityName: result[0].activity.uniqueCode,
      checkIds: [],
    };
    giftAwardDto.taskName = result[0].taskCondition?.customParam?.taskName;
    const resourceItems: AwardResourceDto[] = [];
    const awardResource: SendResourceDto = {
      activityId: result[0].activityId,
      busUserId: busUserId,
      uniqueCode: result[0].requestId,
      items: resourceItems,
      checkIds: [],
      activityCode: result[0].activity.uniqueCode,
    };
    for (const info of result) {
      const item: AwardItemDto = new AwardItemDto();
      const rewardNames = [];
      item.level = info?.targetValue || -1;
      item.reward = [];
      item.imContent = {
        imMsg: info.taskInstance.noticeContent,
        imMsgTitle: info.taskInstance.noticeTitle,
        imMsgUrl: info.taskInstance.noticeUrl,
      };
      item.conditionTags = info.taskCondition.conditionTags;
      giftAwardDto.checkIds.push(...info.checkIds);
      awardResource.checkIds.push(...info.checkIds);
      for (const i of info.checkInfo) {
        if (i.awardInstance.award.type == ResourceType.Out) {
          //外部资源奖励.
          // instanceIds.push(i.id);
          item.reward.push({
            itemId: i.awardInstance.award.keyId,
            type: i.awardInstance.award.keyType,
            number: i.awardNumber || i.awardInstance.number,
            days: i.awardDays || i.awardInstance.days,
          });
          const days =
            (i.awardDays || i.awardInstance.days) > 0
              ? `${i.awardDays || i.awardInstance.days} days`
              : '';
          const number =
            i.awardNumber ||
            (i.awardInstance.number > 1 ? `${i.awardInstance.number}` : '');
          rewardNames.push(`${number} ${i.awardInstance?.award?.name} ${days}`);
        } else {
          //内部资源奖励
          awardResource.items.push({
            amount: i.awardNumber || i.awardInstance.number,
            source: i.id,
            balanceRequired: info.targetValue as number,
            type: i.awardInstance.award.type,
          });
        }
      }
      item.rewardName = rewardNames.join(' + ');
      giftAwardDto.items.push(item);
    }
    // return;
    const sendRet = {
      reward: -1,
      resource: -1,
    };
    let checkRet = true;
    let msgParams = {};
    // console.log(giftAwardDto, awardResource);
    if (giftAwardDto.items.length > 0) {
      checkRet = await this.checkAwardBeforeSend(giftAwardDto);
      msgParams = await this.getAwardValue(giftAwardDto);
      if (checkRet) {
        const ret = await this.sendGiftAward(giftAwardDto);
        // console.log(ret);
        sendRet.reward = Number(ret);
      }
    }
    if (awardResource.items.length > 0) {
      const ret = await this.sendResourceAward(awardResource);
      sendRet.resource = Number(ret);
    }
    // 奖励发送 发送消息.
    const { taskCondition, taskInstance } = result[0];
    // console.log
    if (taskInstance.timing == TaskTiming.AwardSend && checkRet) {
      this.utils.sendMsgNotifi(
        busUserId,
        taskCondition,
        taskInstance,
        msgParams,
        {
          gift: giftAwardDto,
          resource: awardResource,
        }
      );
    }
    for (const completedInfo of result) {
      this.upIssue(completedInfo.id);
    }
    return sendRet;
  }
  async sendAward(dto: SendAwardDto, type: TaskScheduleMode) {
    const baseUrl = this.configService.get('SENDAWARDURL');
    const sendAwardUrl = this.configService.get('SendResourceUrl');
    const info = await this.getCheckAwardInfo(dto.checkId);
    this.logger.debug(dto.checkId, 'sendAward');
    if (info) {
      const obj: SendAwardDto = {};
      obj.requestId = info.requestId;
      obj.activityName = `${info?.activity?.uniqueCode}`;
      obj.userId = info.busUserId;
      obj.items = [];
      const actServer = this.moduleRef.get<ActivityService>(
        require('../activity/activity.service').ActivityService,
        { strict: false }
      );
      const actInfo = await actServer.getInfo(info?.activity?.uniqueCode);
      actInfo.tasks.forEach((_t) => {
        _t.taskConditions.forEach((_cond) => {
          if (_cond.id == info.taskConditionId) {
            obj.taskName = _cond.customParam?.taskName;
          }
        });
      });
      const resourceItems: AwardResourceDto[] = [];
      const awardResource: SendResourceDto = {
        activityId: info.activity.id,
        busUserId: info.busUserId + '',
        items: resourceItems,
        uniqueCode: info.requestId,
        activityCode: `${info?.activity?.uniqueCode}`,
      };
      const item: AwardItemDto = new AwardItemDto();
      if (info?.targetValue) {
        item.level = info?.targetValue;
      } else {
        item.level = -1;
      }
      // item.rewardName = info.taskInstance.alias_name;
      item.reward = [];
      obj.items.push(item);
      const instanceIds = []; //普通外部奖励资源实例id.
      const resourceAwardInstanceIds = []; //资源奖励实例id
      const rewardNames = [];
      for (const i of info.checkInfo) {
        if (i.checkStatus == CheckStatus.Ing) {
          throw new MyHttpException({
            statusCode: ErrorCode.AwardNoCheck.CODE,
          });
        }
        if (
          i.issue == YesOrNo.No &&
          ((i.checkStatus == CheckStatus.Success &&
            type == TaskScheduleMode.Active) || //审核成功的需要主动点击发送按钮。
            i.checkStatus == CheckStatus.No)
        ) {
          if (i.awardInstance.award.type == ResourceType.Out) {
            instanceIds.push(i.id);
            item.reward.push({
              itemId: i.awardInstance.award.keyId,
              type: i.awardInstance.award.keyType,
              number: i.awardNumber || i.awardInstance.number,
              days: i.awardDays || i.awardInstance.days,
            });
            const days =
              (i.awardDays || i.awardInstance.days) > 0
                ? `${i.awardDays || i.awardInstance.days} days`
                : '';
            const number =
              i.awardNumber ||
              (i.awardInstance.number > 1 ? `${i.awardInstance.number}` : '');
            rewardNames.push(
              `${number} ${i.awardInstance?.award?.name} ${days}`
            );
          } else {
            resourceAwardInstanceIds.push(i.id);
            //内部资源奖励
            awardResource.items.push({
              amount: i.awardNumber || i.awardInstance.number,
              source: i.id,
              balanceRequired: info.targetValue as number,
              type: i.awardInstance.award.type,
            });
          }
        }
      }
      item.rewardName = rewardNames.join(' + ');
      item.imContent = {
        imMsg: info.taskInstance.noticeContent,
        imMsgTitle: info.taskInstance.noticeTitle,
        imMsgUrl: info.taskInstance.noticeUrl,
      };
      item.conditionTags = info.taskCondition.conditionTags;

      let hasErr;
      let defaultCheck = true;
      if (type == TaskScheduleMode.Passive) {
        defaultCheck = await this.checkAwardBeforeSend(obj);
      }
      const lockId = `sendAwardLog:${info.busUserId}:${info.activityId}`;
      await this.redisLock.lock(lockId, 1000 * 60 * 0.5);
      if (item.reward.length > 0 && defaultCheck) {
        //发送外部资源奖励.
        this.logger.debug(obj, 'out award');
        const result = await this.httpService
          .post(`${baseUrl}`, obj)
          .toPromise();
        const code = parseInt(result.data.returnCode) ?? -2;
        await this.completeTaskRepository
          .createQueryBuilder()
          .update()
          .set({
            requestRet: code,
          })
          .where({
            id: info.id,
          })
          .execute();
        if (code) {
          //失败
          this.logger.error(result.data);
          await this.completeTaskRepository.increment(
            {
              id: info.id,
            },
            'failCnt',
            1
          );
          hasErr = code;
        } else {
          //成功.
          await this.awardCheckRepository.update(instanceIds, {
            issue: YesOrNo.Yes,
          });
        }
      }
      if (awardResource.items.length > 0) {
        //发送资源奖励
        const result = await this.httpService
          .post(`${sendAwardUrl}`, awardResource)
          .toPromise();
        this.logger.log(
          {
            resourceAwardInstanceIds,
            reuslt: result.data,
            awardResource,
          },
          'send resource award'
        );
        if (result.data.code == 0) {
          await this.awardCheckRepository.update(resourceAwardInstanceIds, {
            issue: YesOrNo.Yes,
          });
        } else {
          await this.completeTaskRepository.increment(
            {
              id: info.id,
            },
            'failCnt',
            1
          );
          hasErr = result.data.code;
        }
      }
      await this.redisLock.unlock(lockId);
      if (hasErr !== undefined) {
        throw new Error('奖励发送异常' + hasErr);
      }
      // 发送奖励消息
      if (info.taskInstance.timing == TaskTiming.AwardSend && defaultCheck) {
        const msgParams = this.getAwardValue(obj);
        this.utils.sendMsgNotifi(
          info.busUserId,
          info.taskCondition,
          info.taskInstance,
          msgParams,
          {
            gift: obj,
            resource: awardResource,
          }
        );
      }
      this.upIssue(info.id);
    } else {
      throw new MyHttpException({
        message: '奖励未找到',
      });
    }
  }
  //发送资源奖励
  async sendResourceAward(awardResource: SendResourceDto) {
    const sendAwardUrl = this.configService.get('SendResourceUrl');
    const { checkIds, ...rest } = awardResource;
    try {
      this.logger.debug(rest, 'sendResourceAward');
      const result = await this.httpService
        .post(`${sendAwardUrl}`, rest)
        .toPromise();
      if (result.data.code == 0) {
        await this.awardCheckRepository.update(checkIds, {
          issue: YesOrNo.Yes,
        });
      }
      return result.data.code;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
  //发送礼物奖励
  async sendGiftAward(dto: SendAwardDto) {
    const baseUrl = this.configService.get('SENDAWARDURL');
    const { checkIds, ...rest } = dto;
    try {
      this.logger.debug(rest, 'sendGiftAward');
      const result = await this.httpService
        .post(`${baseUrl}`, rest)
        .toPromise();
      const code = parseInt(result.data.returnCode);
      if (code == 0) {
        await this.awardCheckRepository.update(checkIds, {
          issue: YesOrNo.Yes,
        });
      }
      return code;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
  //获取当前发送奖励的价值 按 type 分别计算
  getAwardValue(dto: SendAwardDto) {
    const values = {
      beans: 0,
      gold: 0,
      gem: 0,
    };
    for (const item of dto.items) {
      for (const reward of item.reward) {
        switch (+reward.type) {
          case 3: //beans
            values.beans += reward.number;
            break;
          case 4: //gold
            values.gold += reward.number;
            break;
          case 5: //gem
            values.gem += reward.number;
            break;
        }
      }
    }
    return values;
  }
  //发送奖励前 进行 预警检查。
  async checkAwardBeforeSend(dto: SendAwardDto): Promise<boolean> {
    const actSvr = this.moduleRef.get<ActivityService>(
      require('../activity/activity.service').ActivityService,
      { strict: false }
    );
    const waringSvr = this.warnServer;
    const actInfo = await actSvr.getInfo(dto.activityName);
    const waringRepo = this.dataSource.getRepository(WarningNoticeEntity);
    const warningInfo = await waringSvr.getOneInfo(dto.activityName);
    if (!warningInfo) {
      this.logger.debug('没有预警配置', dto.activityName);
      return false;
    }
    let result = true; //true可以发送
    //限制1分钟内只能发送一次
    //当前要发送的奖励价值
    let currentAwardValue = 0;
    dto.items.forEach((i) => {
      i.reward.forEach((j) => {
        if (+j.itemId == -1) {
          switch (+j.type) {
            case 3: //beans
              currentAwardValue += +j.number;
              break;
            case 4: //gold
              currentAwardValue += +j.number / 100;
              break;
            case 5: //gem
              currentAwardValue += +j.number / 2;
              break;
          }
        }
      });
    });
    const hasVal = await this.utils.getAwardValueCache(dto.activityName);
    const lockKey = `checkAwardBeforeSend:${dto.activityName}`;
    await this.redisLock.lock(lockKey, 1000 * 60 * 0.5);
    const r1 = warningInfo.riskValue * warningInfo.riskValueRate;
    const r2 = warningInfo.riskValue;
    const m = currentAwardValue + hasVal;
    let updateResult: UpdateResult;
    if (m > r1 && m < r2) {
      //更新预警状态
      result = false;
      await actSvr.updateTaskConditionCheckStatus(actInfo, true);
      updateResult = await waringRepo.update(warningInfo.id, {
        status: WarningNotifyStatus.Check,
      });
      this.logger.debug('first warning');
    }
    if (m >= r2) {
      result = false;
      //下线活动，强制停止
      await actSvr.update({
        id: actInfo.id,
        status: SwitchStatus.No,
        end_time: new Date().toJSON(),
      });
      updateResult = await waringRepo.update(warningInfo.id, {
        status: WarningNotifyStatus.Close,
      });

      this.logger.debug('close activity...');
    }
    if (m > r1 && updateResult && updateResult.affected > 0) {
      //清除缓存
      // const key = this.utils.getActInfoCacheKey(actInfo.uniqueCode);
      // actSvr.getInfo(actInfo.uniqueCode);
      // actInfo.status = SwitchStatus.No;
      actSvr.getActivityInfo(actInfo.id + '').then((newActInfo) => {
        this.utils.setActInfoCache(newActInfo);
      });
    }
    await this.redisLock.unlock(lockKey);
    this.logger.debug(`当前奖励价值:${currentAwardValue}: ${m} ${r1}`);
    return result;
  }
  async upIssue(completeId) {
    const info = await this.completeTaskRepository
      .createQueryBuilder('t1')
      .leftJoinAndSelect('t1.checkInfo', 'checkInfo')
      .whereInIds([completeId])
      .getOne();
    const isSend = info.checkInfo.filter((i) => i.issue == YesOrNo.Yes);
    const tLen = info.checkInfo.length;
    const sendLen = isSend.length;
    let status;
    if (tLen == sendLen && sendLen > 0) {
      //全部发送
      status = AwardSendStatus.All;
    }
    if (sendLen == 0) {
      //未发送
      status = AwardSendStatus.Not;
    }
    if (sendLen > 0 && tLen != sendLen) {
      //部分发送
      status = AwardSendStatus.Part;
    }
    await this.completeTaskRepository.update(completeId, {
      issue: status,
    });
    this.logger.debug('up issue finish');
  }
  async importExcel(file) {
    const { buffer } = file; // file为前端上传的excel
    const workSheetsFromBuffer = xlsx.parse(buffer);
    const awards: AwardEntity[] = [];
    const result = workSheetsFromBuffer[0].data as [];
    for (let index = 0; index < result.length; index++) {
      const rowData: string[] = result[index];
      if (index > 0 && rowData?.length > 0) {
        //第二行开始
        const award = new AwardEntity();
        award.name = rowData?.[0];
        award.image = rowData?.[1];
        award.numAttr = parseInt(rowData?.[2]?.split(':')?.[0]);
        award.type = rowData?.[3]?.split(':')?.[0] as any;
        award.keyType = rowData?.[4];
        award.keyId = rowData?.[5];
        award.group_name = rowData?.[6];
        award.weight = parseInt(rowData?.[7] ?? '0');
        const cat = new CategoryAwardEntity();
        cat.id = parseInt(rowData?.[8]?.split(':')?.[0]);
        if (cat.id) {
          award.category = cat;
        }
        awards.push(award);
      }
    }
    return this.awardRepository.save(awards);
  }

  async exportExcel(dto, res) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('奖励列表');
    const build = await this.getCheckAwardQueryBuild(dto);
    const stream = await build.stream();
    worksheet.columns = [
      {
        header: '用户ID',
        key: 'userId',
        width: 20,
      },
      {
        header: '奖励名称',
        key: 'awardName',
        width: 40,
      },
      {
        header: '奖励数量',
        key: 'awardNumber',
        width: 20,
      },
      {
        header: '奖励天数',
        key: 'awardDays',
        width: 20,
      },
      {
        header: '活动id',
        key: 'activityId',
        width: 20,
      },
      {
        header: '任务实例别名',
        key: 'taskAliasName',
        width: 40,
      },
      {
        header: '是否发送',
        key: 'issue',
        width: 20,
      },
      {
        header: '创建时间',
        key: 'create_at',
        width: 20,
      },
      {
        header: '审核状态',
        key: 'checkStatus',
        width: 20,
      },
    ];
    worksheet.views = [
      { state: 'frozen', ySplit: 1 }, // ySplit: 1 表示冻结第一行
    ];
    stream.on('data', (row) => {
      // console.log(row);
      worksheet.addRow({
        userId: row['t1_bus_user_id'],
        awardName: row['srcaward_name'],
        awardNumber: row['checkInfo_award_number'] || row['awardIns_number'],
        awardDays: row['checkInfo_award_days'] || row['awardIns_days'],
        activityId: row['t1_activity_id'],
        taskAliasName: row['taskInstance_alias_name'],
        issue: row['checkInfo_is_sue'] == YesOrNo.Yes ? '是' : '否',
        create_at: moment(row['t1_create_at']).format('YYYY-MM-DD HH:mm:ss'),
        checkStatus:
          row['checkInfo_check_status'] == CheckStatus.Ing
            ? '未审核'
            : row['checkInfo_check_status'] == CheckStatus.Success
              ? '审核通过'
              : row['checkInfo_check_status'] == CheckStatus.Fail
                ? '审核失败'
                : '无需审核',
      });
    });
    stream.on('end', () => {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');
      workbook.xlsx.write(res).then(() => {
        res.end();
      });
    });
    return;
  }
  //生成导入模板
  async buildImportTmp() {
    const list = await this.categoryRepository.find();
    const categoryArr = [];
    list.forEach((i) => {
      if (i.name) {
        categoryArr.push(`${i.id}:${i.name}`);
      }
    });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('奖励导入模板');
    const configInfo = await this.sysconfigRepository.findOne({ where: {} });
    const formulae = [];
    let formulaeStrLength = 0;
    configInfo?.resourceType?.forEach((i) => {
      if (i.value && formulaeStrLength < 255) {
        formulae.push(`${i.value}`);
        formulaeStrLength += i.value.length;
      }
    });
    // console.log([`"${formulae.join(',')}"`]);
    sheet.columns = [
      {
        header: '奖励名称',
        key: '1',
        width: 20,
      },
      {
        header: '奖励图片（url)',
        key: '2',
        width: 20,
      },
      {
        header: '奖励属性',
        key: '3',
      },
      {
        header: '奖励资源类型',
        key: '4',
      },
      {
        header: '映射业务类型',
        key: '5',
      },
      {
        header: '映射业务id',
        key: '6',
      },
      {
        header: '分组',
        key: '7',
      },
      {
        header: '权重',
        key: '8',
      },
      {
        header: '分类',
        key: '9',
        width: 20,
      },
    ];
    for (let index = 2; index < 100; index++) {
      sheet.getCell('C' + index).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"1:固定,2:动态"'],
      };
      sheet.getCell('D' + index).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${formulae.join(',')}"`],
      };
      sheet.getCell('I' + index).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${categoryArr.join(',')}"`],
      };
    }
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
  async getIdByName(names: MappNameToIdDto) {
    const mapFunc = (arr, key = 'name') => {
      return arr.reduce((pre, next) => {
        pre[next[key]] = next.id;
        return pre;
      }, {});
    };
    Object.keys(names).forEach((name) => {
      if (!Array.isArray(names?.[name]) || names?.[name]?.length === 0) {
        names[name] = [''];
      }
    });
    console.log(names);
    let awardPro = Promise.resolve([]);
    if (names?.awardNames?.length > 0)
      awardPro = this.awardRepository
        .createQueryBuilder('t1')
        .select(['t1.id', 't1.name'])
        .where('t1.name IN (:...names)', {
          names: names?.awardNames,
        })
        .getMany();
    let taskPro = Promise.resolve([]);
    if (names?.taskNames?.length > 0)
      taskPro = this.dataSource
        .getRepository(TaskEntity)
        .createQueryBuilder('t1')
        .select(['t1.id', 't1.name'])
        .where('t1.name IN (:...names)', {
          names: names.taskNames,
        })
        .getMany();
    let awardGroupPro = Promise.resolve([]);
    if (names?.awardGroupNames?.length > 0)
      awardGroupPro = this.dataSource
        .getRepository(AwardGroupEntity)
        .createQueryBuilder('t1')
        .select(['t1.id', 't1.name'])
        .where('t1.name IN (:...names)', {
          names: names.awardGroupNames,
        })
        .getMany();
    let targetPro = Promise.resolve([]);
    if (names?.targetNames?.length > 0)
      targetPro = this.dataSource
        .getRepository(BusinessTargetEntity)
        .createQueryBuilder('t1')
        .select(['t1.id', 't1.name'])
        .where('t1.name IN (:...names)', {
          names: names.targetNames,
        })
        .getMany();
    let ruleConfigPro = Promise.resolve([]);
    if (names?.dataRule?.length > 0)
      ruleConfigPro = this.dataSource
        .getRepository(RuleConfigEntity)
        .createQueryBuilder('t1')
        .select(['t1.id', 't1.name'])
        .where('t1.name IN (:...names)', {
          names: names.dataRule,
        })
        .getMany();
    const tagRulePro = this.dataSource
      .getRepository(TagRuleEntity)
      .createQueryBuilder('t1')
      .select(['t1.id', 't1.name'])
      .getMany();
    const [
      awardNames,
      taskNames,
      awardGroupNames,
      targetNames,
      dataRule,
      tagRule,
    ] = await Promise.all([
      awardPro,
      taskPro,
      awardGroupPro,
      targetPro,
      ruleConfigPro,
      tagRulePro,
    ]);
    return {
      award: mapFunc(awardNames),
      task: mapFunc(taskNames),
      awardGroup: mapFunc(awardGroupNames),
      target: mapFunc(targetNames),
      dataRule: mapFunc(dataRule),
      tagRule: mapFunc(tagRule),
    };
  }

  async getBusinessAwardInfo(id: string) {
    const domain = this.configService.get('OpenApi');
    const ret = await this.httpService
      .get(`${domain}/activity/reward/info?rewardId=${id}`)
      .toPromise();
    return ret.data;
  }
}
