import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Utils } from 'apps/sem-api/src/common/utils/utils';
import { Consumer, Kafka, logLevel, KafkaJSProtocolError } from 'kafkajs';
import { ActivityService } from './activity.service';
import * as moment from 'moment';
import {
  ConditionUnique,
  SwitchStatus,
  TaskScheduleMode,
} from 'apps/sem-api/src/common/enum';
import * as md5 from 'blueimp-md5';


import { BusinessTargetEntity } from 'apps/sem-api/src/entity/business.arget.entity';
import { Cache } from 'cache-manager';
import { RedisLockService } from '@app/sem-api/modules/redisLock/redisLock.service';

export interface Message {
  id: string;
  identification: string;
  amount: number;
  time: number;
  tag: string;
  type: string;
  uniqueCode: string;
}
@Injectable()
export class KafkaService {
  private kafka: Kafka;
  private kafkaConsumer: Consumer;
  private readonly logger = new Logger(KafkaService.name);
  constructor(
    private readonly utils: Utils,
    private readonly configService: ConfigService,
    private readonly activityService: ActivityService,
    private readonly redisLock: RedisLockService
  ) {
    // const topic = this.configService.get<string>('KafkaTopic');
    // const groupId = this.configService.get<string>('KafkaGroupId');
    // const consumer = kafka.consumer({ groupId: groupId });
    console.log('kafka service init');
    this.createKafkaConsumer();
  }

  private createKafkaConsumer(): Consumer {
    const groupId = this.configService.get<string>('KafkaGroupId');
    const kafka = new Kafka({
      logLevel: logLevel.INFO,
      brokers: async () => {
        const brokesStr = await this.configService.get('KafkaBrokers');
        return brokesStr.split(',');
      },
      clientId: `sem-client`,
      retry: {
        retries: Number.MAX_SAFE_INTEGER,
        initialRetryTime: 1000,
        factor: 0.5,
        multiplier: 3,
        restartOnFailure: async () => {
          return true;
        },
      },
      logCreator: (logLevel) => ({ namespace, level, label, log }) => {
        const { timestamp, logger, message, ...others } = log;
        const info = `${label} [${namespace}] ${message} ${JSON.stringify(
          others
        )}`;
        this.logger.debug(info, 'kafka');
      },
    });
    if (this.kafka) {
      this.kafka = null;
    }
    this.kafka = kafka;
    const consumer = kafka.consumer({ groupId });
    if (this.kafkaConsumer) {
      this.kafkaConsumer = null;
    }
    this.kafkaConsumer = consumer;
    return consumer;
  }

  async retryConsumer(topic) {
    await this.createKafkaConsumer();
    await this.consumerRun(topic);
  }
  async consumerRun(reqTopic) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    const consumer = this.kafkaConsumer;
    await consumer.connect();
    await consumer.subscribe({
      topics: reqTopic?.split(','),
    });
    await consumer.run({
      autoCommit: false,
      partitionsConsumedConcurrently: 10,
      eachBatchAutoResolve: false,
      // eachBatch: async ({
      //   batch,
      //   resolveOffset,
      //   heartbeat,
      //   isRunning,
      //   isStale,
      // }) => {
      //   for (const message of batch.messages) {
      //     if (!isRunning() || isStale()) break;
      //     if (message.value) {
      //       const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`;
      //       that.logger.log(`- ${prefix} ${message.key}#${message.value}`);
      //       const json: Message = JSON.parse(message.value.toString());
      //       await that.processMessage(json);
      //       resolveOffset(message.offset);
      //       await heartbeat();
      //     }
      //   }
      // },
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        try {
          const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
          if (message.value) {
            // that.logger.log(
            //   `- ${prefix} ${message.key}#${message.value}`,
            //   'kafka'
            // );
            const json: Message = JSON.parse(message.value.toString());
            await that.processMessage(json);
            await consumer.commitOffsets([
              {
                topic: topic,
                partition,
                offset: (Number(message.offset) + 1).toString(),
              },
            ]);
            await heartbeat();
          }
        } catch (e) {
          that.logger.error(e.message);
          throw e;
        }
      },
    });
  }
  async admin() {
    const admin = this.kafka.admin();
    await admin.connect();
    const groupId = this.configService.get<string>('KafkaGroupId');
    const topic = this.configService.get<string>('KafkaTopic');
    try {
      // 获取消费组状态
      const groupDescriptions = await admin.describeGroups([groupId]);
      // console.log(groupDescriptions);
      const groupInfo = groupDescriptions.groups.find(
        (i) => i.groupId === groupId
      );
      const groupState = groupInfo?.state;
      console.log(`Consumer group state: ${groupState}`);
      // 检查条件（示例：如果消费组状态为 "Empty"，重新创建消费者）
      if (groupState === 'Empty' || groupState === 'Dead') {
        console.log('Consumer group is empty or dead. Recreating consumer...');
        this.retryConsumer(topic);
      }
    } catch (error) {
      console.error('Error monitoring consumer group:', error.message);
    } finally {
      await admin.disconnect();
    }
  }
  async processMessage(json: Message) {
    //事件消费。
    const cacheClient: Cache = this.utils.cache;
    const busTime = new Date(json.time).toJSON(); //业务产生时间
    const activityInfo = await this.activityService.getInfo(json.uniqueCode);
    const noraml = await this.utils.checkActNoraml(activityInfo, busTime);
    if (!noraml) {
      return;
    }
    const checkRet = await this.activityService.checkTag(
      activityInfo,
      activityInfo.tagConfig,
      json.identification
    );
    if (!checkRet) {
      // this.logger.log(`当前活动${activityInfo.uniqueCode}标签未对该用户开放`);
      return false;
    }
    if (json.uniqueCode.startsWith('talent_')) {
      this.logger.debug(json, 'kafka');
    }
    await this.redisLock.lock(
      `lock:kafka:${json.uniqueCode}:${json.identification}`,
      10
    );
    for (const task of activityInfo.tasks) {
      const checkTaskTagRet = await this.activityService.checkTag(
        activityInfo,
        task.tagConfig,
        json.identification
      );
      if (!checkTaskTagRet) {
        // this.logger.log(`当前任务${task.id}标签未对该用户开放`);
        continue;
      }
      const noStart = moment(task.start_time).isAfter(moment());
      const isEnd = moment(task.end_time).isBefore(moment());
      if (noStart || isEnd) {
        this.logger.log(`task info(${task.id}) ${noStart}, 'isEnd', ${isEnd}`);
        continue;
      }
      for (const cond of task.taskConditions) {
        const scheduleMode =
          cond?.customParam?.scheduleMode ?? task?.task?.scheduleMode;
        if (scheduleMode != TaskScheduleMode.Passive) {
          // this.logger.log(`非被动任务....条件id ${cond.id}`);
          continue;
        }
        // this.logger.log(json, 'kafka');
        //根据条件的周期计算 redis过期时间
        const condTtl = this.utils.getConditionTtl(cond, activityInfo);
        if (task?.task?.custom_param?.isRound == 1) {
          // console.log('轮次事件', task.id);
          const roundNumber = Number(task?.task?.custom_param?.round); //每900000轮一次
          //算出当前轮次
          const currentRound = Math.ceil(json.amount / roundNumber);
          // 循环轮次
          const key = this.utils.getConditonKey(json.tag, json['params']);
          for (let round = 0; round < currentRound; round++) {
            const requestId = `${activityInfo.uniqueCode}:${task.id}:${json.identification
              }:${this.utils.getTimekeyByDate(
                moment(busTime),
                cond,
                activityInfo
              )}:round:${round + 1}`;
            const hasKey = await cacheClient.get(requestId + ':' + cond.id);
            if (hasKey) {
              continue;
            }
            const targetReturnData = {}; //事件指标数据。
            targetReturnData[key] = json.amount - round * roundNumber; //当前事件的数据
            const condtionWhere = this.utils.parseCondition(
              cond.conditions,
              'obj.'
            );
            const evalStr = `const obj=${JSON.stringify(
              targetReturnData
            )};${condtionWhere}`;
            const isComplete = eval(evalStr);
            if (isComplete) {
              this.logger.log(`evalStr: ${evalStr}`, 'kafka round event');
              try {
                await this.activityService.saveTaskAwardLog({
                  taskCondition: cond,
                  taskInfo: task,
                  actInfo: activityInfo,
                  userId: json.identification,
                  requestId: requestId,
                  targetValue: json.amount,
                  busTime: busTime,
                });
              } catch (error) {
                this.logger.error(error.message);
              }
              await cacheClient.set(requestId + ':' + cond.id, 1, condTtl * 1000);
            }
          }
          continue;
        }
        const targetReturnData = {}; //事件指标数据。
        const keyIdsSet = this.utils.findKeyId(cond.conditions);
        let keyIds = Array.from(
          new Set(Array.from(keyIdsSet).map((_k) => _k.id + ''))
        );
        if (keyIds.length > 1) {
          let timeStr = '';
          switch (cond.sendLimit) {
            case ConditionUnique.Day:
              timeStr = moment(busTime).format('YYYYMMDD');
              break;
            case ConditionUnique.Month:
              timeStr = moment(busTime).format('YYYYMM');
              break;
            case ConditionUnique.Hour:
              timeStr = moment(busTime).format('YYYYMMDDHH');
              break;
            case ConditionUnique.Week:
              timeStr = moment(busTime).format('gggg-ww');
              break;
            case ConditionUnique.WeekOfMonth:
              const time = moment(busTime);
              timeStr = moment(busTime).format(
                `YYYY-MM-${Math.ceil(+time.format('DD') / 7)}`
              );
              break;
          }
          if (timeStr) {
            keyIds = keyIds.map((_j) => `${_j}_${timeStr}`);
          }
          const userResources = await this.activityService.getBusUserResource(
            json.identification,
            activityInfo,
            keyIds
          );
          userResources.forEach((resource) => {
            //历史事件的数据.
            const tarKey = this.utils.getConditonKey(
              resource.type.split('_')[0]
            );
            if (tarKey) {
              targetReturnData[tarKey] = Number(resource.amount);
            }
          });
        }
        const key = this.utils.getConditonKey(json.tag, json['params']);
        targetReturnData[key] = json.amount; //当前事件的数据
        const divIntWhere = this.utils.parseConditionDivInt(
          cond.conditions,
          'item.'
        );
        if (divIntWhere) {
          const evalStr = `const item = ${JSON.stringify(
            targetReturnData
          )};${divIntWhere}`;
          const times = eval(evalStr);
          // const times = result;
          this.logger.log({ evalStr, times }, 'divIntWhere');
          if (times > 0) {
            // 读取新的key
            let preTimes = await this.utils.getPreTimesCache(
              json.identification,
              moment(busTime),
              cond,
              activityInfo
            );
            if (!preTimes) {
              preTimes =
                (await this.utils.getTimesCache<number>(
                  json.identification,
                  cond.id
                )) || 0;
              if (preTimes) {
                await this.utils.delTimesCache(json.identification, cond.id);
              }
            }
            const diffTimes = times - preTimes;
            this.logger.log(
              {
                userId: json.identification,
                preTimes,
                times,
                diffTimes,
              },
              'diffTimes'
            );
            try {
              if (diffTimes > 0) {
                await this.activityService.saveTaskAwardLog({
                  taskCondition: cond,
                  actInfo: activityInfo,
                  taskInfo: task,
                  userId: json.identification,
                  requestId: json.id,
                  times: diffTimes,
                  totalTimes: times,
                  targetValue: json.amount,
                  busTime: busTime,
                });
              }
            } catch (error) {
              this.logger.error(error.message);
            }
            // await this.utils.setTimesCache(
            //   json.identification,
            //   cond.id,
            //   times,
            //   condTtl
            // );
            await this.utils.setPreTimesCache(
              json.identification,
              moment(busTime),
              cond,
              activityInfo,
              times
            ); //存到新的key里面
          }
        } else {
          const condtionWhere = this.utils.parseCondition(
            cond.conditions,
            'obj.'
          );
          const evalStr = `const obj=${JSON.stringify(
            targetReturnData
          )};${condtionWhere}`;
          const isComplete = eval(evalStr);
          if (isComplete) {
            this.logger.log(evalStr, 'call target eval');
            try {
              await this.activityService.saveTaskAwardLog({
                taskCondition: cond,
                taskInfo: task,
                // activityId: activityInfo.id,
                actInfo: activityInfo,
                userId: json.identification,
                requestId: json.id,
                targetValue: json.amount,
                busTime: busTime,
              });
            } catch (error) {
              this.logger.error(error.message);
            }
          }
        }
      }
    }
    return true;
  }
}
