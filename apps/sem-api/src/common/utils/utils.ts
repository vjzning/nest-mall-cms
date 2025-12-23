import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as bcrypt from 'bcryptjs';
import { Cache } from 'cache-manager';
import { TaskAwardInstanceEntity } from '../../entity/activities.task.award';
import { AwardGroupEntity } from '../../entity/award.group.entity';
import { ActivityService } from '../../modules/admin/system/activity/activity.service';
import { ALL_ROUTERS } from '../constants/const';
import { IndicatorDto, RouterDto } from '../dto/index';
import * as _ from 'lodash';
import {
  AwardGroupProbEntity,
  AwardGroupProbLimitType,
} from '../../entity/award.group.prob.entity';
import * as md5 from 'blueimp-md5';
import { SendMsgDto } from '../../modules/admin/system/activity/dto';
import * as moment from 'moment';
import { RedisClientService } from '../../modules/redisClient/redisClient.service';

import { ActivityEntity } from '../../entity/activities.entity';
import { ConditionUnique, SwitchStatus } from '../enum';
import { TaskConditionEntity } from '../../entity/task.condition.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { HttpService } from '@nestjs/axios'
@Injectable()
export class Utils {
  private readonly logger = new Logger(Utils.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private cacheManage: Cache,
    private readonly redisClientService: RedisClientService,
  ) { }
  get cache() {
    return this.cacheManage;
  }
  arrToTree(data, pid = null) {
    // eslint-disable-next-line prefer-const
    let result = [],
      temp;
    const length = data.length;
    for (let i = 0; i < length; i++) {
      if (data[i].pid == pid) {
        data[i].title = data[i].name;
        data[i].key = data[i].id + '';
        result.push(data[i]);
        temp = this.arrToTree(data, data[i].id);
        if (temp.length > 0) {
          data[i].children = temp;
          data[i].chnum = data[i].children.length;
        }
      }
    }
    return result;
  }
  checkPassword(password: string, dbPassword: string) {
    return bcrypt.compareSync(password, dbPassword);
  }
  buildRandomStr(len = 32) {
    const str = 'abcdefghijklmnopqrst0123456789ABCDEFGHIJKLMNOPQRST';
    let ret = '';
    for (let index = 0; index < len; index++) {
      const num = (Math.random() * str.length).toFixed(0);
      ret += str[num];
    }
    return ret;
  }
  public getLogic(arr) {
    const v = arr.find((i) => typeof i == 'string') || '';
    if (v.toUpperCase() == 'AND' || v == '&&') {
      return '&&';
    } else if (v.toUpperCase() == 'OR' || v == '||') {
      return '||';
    } else {
      return '&&';
    }
  }
  // 向下，向上、取整，适配单个条件. 用于解决每达到某个数值，发奖励
  public parseConditionDivInt(arr, prefix) {
    let str = '';
    const v = arr?.[0];
    if (v) {
      const key = this.getConditonKey(v.key_id, v.params);
      switch (v.symbol) {
        case 'floor':
          str += `Math.floor(${prefix}${key}/${v.value})`;
          break;
        case 'ceil':
          str += `Math.ceil(${prefix}${key}/${v.value})`;
          break;
      }
    }
    return str;
  }
  public parseCondition(arr, prefix) {
    const _logic = this.getLogic(arr);
    let str = '';
    const result = [];
    for (const v of arr) {
      if (typeof v == 'object') {
        if (Array.isArray(v) && v.length > 0) {
          str += this.parseCondition(v, prefix);
        } else if (v['key_id']) {
          str = '( ';
          switch (v.symbol) {
            case 'floor':
              break;
            case 'ceil':
              break;
            default:
              const key = this.getConditonKey(v.key_id, v.params);
              str += `${prefix}${key} ${v.symbol} ${v.value}`;
          }
          str += ' )';
          result.push(str);
        }
      }
    }
    const newStr = result.join(` ${_logic} `);
    return newStr;
  }
  public findKeyId(conditions, out?: Set<IndicatorDto>) {
    const newOut = out || new Set<IndicatorDto>();
    for (const v of conditions) {
      if (typeof v == 'object') {
        if (v.key_id) {
          newOut.add({
            id: v.key_id,
            params: v.params,
          });
        } else if (Array.isArray(v)) {
          this.findKeyId(v, newOut);
        }
      }
    }
    return newOut;
  }
  //数组对象相同的key合并。
  public mergeArrKey(arr, key) {
    const newArr = [];
    const hasMap = {};
    for (const item of arr) {
      if (hasMap[item[key]]) {
        //合并
        const saveIndex = newArr.findIndex((i) => i[key] === hasMap[item[key]]);
        newArr[saveIndex] = { ...newArr[saveIndex], ...item };
      } else {
        hasMap[item[key]] = item[key];
        newArr.push(item);
      }
    }
    return newArr;
  }
  public async getAppAllRoutesBySwaggerApi() {
    const port = this.configService.get('AppPort');
    const http = this.httpService;
    return await this.cacheManage?.wrap(ALL_ROUTERS, async function () {
      const { data } = await http
        .get(`http://localhost:${port}/dapi-json`)
        .toPromise();
      const routes = [];
      if (data?.paths) {
        // 将 swagger 数据转换成需要的数据
        const paths = data.paths;
        Object.keys(paths).forEach((path) => {
          Object.keys(paths[path]).forEach((method) => {
            const route = {
              path: path.replace(/\{/g, ':').replace(/\}/g, ''),
              method: method.toUpperCase(),
              desc: paths[path][method].summary,
            };
            route.desc && routes.push(route);
          });
        });
      }
      return routes;
    });
  }
  public getAWSConfig() {
    const credentials = new AWS.SharedIniFileCredentials({
      profile: this.configService.get('AWS_PROFILE') || 'default',
    });
    const region = this.configService.get('AWS_REGION') || 'cn-northwest-1';
    const config = new AWS.Config({
      credentials: credentials,
      region: region,
    });
    return config;
  }
  //根据概率返回概率档位
  public async getAwardInstanceByProb(
    awardGroups: AwardGroupEntity[],
    taskCondition: TaskConditionEntity
  ): Promise<AwardGroupProbEntity[]> {
    const result: AwardGroupProbEntity[] = [];
    for (const awardGroup of awardGroups) {
      //按照概率权重分解奖励集合
      let newList: AwardGroupProbEntity[] = [];
      const cacheKeyMap = {};
      for (const probLevel of awardGroup.probLevelAwards) {
        // redis key
        const cacheKey = `cache:prob:${taskCondition.id}:${probLevel.awardGroupId}:${probLevel.childrenAwardGroupId}:${probLevel.id}`;
        cacheKeyMap[probLevel.id] = cacheKey;
        // 从redis中获取概率权重
        const preLimitTimes = await this.cacheManage.get(cacheKey);
        if (probLevel.limitType != AwardGroupProbLimitType.NONE) {
          if (preLimitTimes && preLimitTimes >= probLevel.limitTimes) {
            //设置概率档位为0
            probLevel.percent = 0;
          }
        }
        for (let i = 0; i < probLevel.percent * 100; i++) {
          newList.push(probLevel);
        }
      }
      newList = _.shuffle(newList);
      const randomNum = _.random(0, newList.length - 1, false);
      const awardProLevel = newList[randomNum];
      // awardProLevel.awardGroup
      result.push(awardProLevel);
      // console.count('awardProLevel_' + awardProLevel.id);
      const key = cacheKeyMap[awardProLevel.id];
      if (awardProLevel.limitType != AwardGroupProbLimitType.NONE) {
        const client = await this.redisClientService.getClient();
        const multi = client.multi();
        multi.incr(key);
        if (awardProLevel.limitType != AwardGroupProbLimitType.TOTAl) {
          //保存到redis中
          // 过期时间为当天结束时间
          let expireTime = 0;
          switch (awardProLevel.limitType) {
            case AwardGroupProbLimitType.DAY:
              expireTime = moment().endOf('day').unix();
              break;
            case AwardGroupProbLimitType.WEEK:
              expireTime = moment().endOf('week').unix();
              break;
            case AwardGroupProbLimitType.MONTH:
              expireTime = moment().endOf('month').unix();
              break;
            default:
          }
          const ttl = expireTime - moment().unix();
          multi.expire(key, ttl);
        }
        await multi.exec();
      }
    }
    return result;
  }
  public getActInfoCacheKey(code) {
    return `cache:actInfo:${code}`;
  }
  public async setActInfoCache(actInfo: ActivityEntity) {
    const ttl = Math.ceil(
      (new Date(actInfo.end_time).valueOf() -
        Date.now() +
        2 * 24 * 60 * 60 * 1000) /
      1000
    ); //活动结束后2天时效
    const key = this.getActInfoCacheKey(actInfo.uniqueCode);
    return await this.cacheManage.set(key, actInfo, {
      ttl: ttl < 0 ? 24 * 60 * 60 : ttl,
    });
  }
  public getTimesCacheKey(userId, conditonId) {
    return `award:preTimes:${userId}:${conditonId}`;
  }

  public async delTimesCache(userId, conditonId) {
    return await this.cacheManage.del(
      this.getTimesCacheKey(userId, conditonId)
    );
  }
  public async getTimesCache<T>(userId, conditonId) {
    return await this.cacheManage.get<T>(
      this.getTimesCacheKey(userId, conditonId)
    );
  }
  public async setTimesCache(userId, conditonId, times, ttl) {
    return await this.cacheManage.set(
      this.getTimesCacheKey(userId, conditonId),
      times,
      {
        ttl,
      }
    );
  }
  public getConditionTtl(
    conditon: TaskConditionEntity,
    actInfo: ActivityEntity
  ) {
    const endTime = actInfo.end_time;
    const startTime = actInfo.start_time;
    const now = moment().unix();
    switch (conditon.sendLimit) {
      case ConditionUnique.Day:
        return moment().endOf('day').unix() - now;
      case ConditionUnique.Hour:
        return moment().endOf('hour').unix() - now;
      case ConditionUnique.Week:
        return moment().endOf('isoWeek').unix() - now;
      case ConditionUnique.NWeek:
        const week = moment().diff(moment(startTime), 'weeks');
        return (
          moment(startTime)
            .add(week + 1, 'weeks')
            .startOf('days')
            .unix() - now
        );
      case ConditionUnique.Month:
        return moment().endOf('month').unix() - now;
      case ConditionUnique.Permanent:
        return moment(endTime).unix() - now;
      case ConditionUnique.WeekOfMonth:
        const s = moment().startOf('month');
        const w = moment().diff(s, 'week');
        const nextWeek = moment(s).add(w + 1, 'weeks');
        return nextWeek.startOf('days').unix() - now;
      default:
        return moment(endTime).unix() - now;
    }
  }
  public getBullKey(id) {
    return `bull:activity:${id}`;
  }
  //获取条件key
  public getConditonKey(keyId, params?) {
    let parStr = '';
    if (params) {
      // 解决 key 与 顺序无关
      const sortedParams = {};
      Object.keys(params)
        .sort()
        .forEach((key) => {
          sortedParams[key] = params[key];
        });
      parStr = JSON.stringify(sortedParams);
    }
    return 'KEY_' + md5(keyId + parStr);
  }
  public interpolate(template, data = {}) {
    return template.replace(
      /\${\s*(.*?)\s*}/g,
      (match, key) => data[key] || match
    );
  }
  async sendMsgNotifi(userId, conditon, taskInfo, params = {}, award = {}) {
    const noticeContent = this.interpolate(taskInfo.noticeContent, params);
    const noticeTitle = this.interpolate(taskInfo.noticeTitle, params);
    const msg: SendMsgDto = {
      userId: userId,
      msg: noticeContent,
      msgTitle: noticeTitle,
      msgUrl: taskInfo.noticeUrl,
      ...(conditon?.customParam || {}),
      award: award,
    };
    console.log(msg, params);
    this.logger.debug(msg, 'sendMsgNotifi');
    if (!msg.msg || !msg.msgTitle) {
      return;
    }
    try {
      const domain = this.configService.get('OpenApi');
      const reuslt = await this.httpService
        .post(`${domain}/activity/send/message`, msg)
        .toPromise();
      this.logger.debug(reuslt.data, 'sendMessage');
      return reuslt.data;
    } catch (e) {
      this.logger.error(e);
    }
  }
  getUserTagMapKey(businessId) {
    return `cache:userTagMap:${businessId}`;
  }
  async checkActNoraml(activityInfo: ActivityEntity, busTime) {
    if (!activityInfo) {
      this.logger.log(`${activityInfo.uniqueCode} not found`);
      return false;
    }
    const { uniqueCode, status } = activityInfo;
    if (activityInfo.isDel || activityInfo.status == SwitchStatus.No) {
      this.logger.log(
        `${uniqueCode} isDel: ${activityInfo.isDel} status: ${status}`
      );
      return false;
    }
    //检查当前时间 是否在活动时间内
    const nowDate = busTime || new Date();
    const noStart = moment(activityInfo.start_time)
      .utc()
      .isAfter(moment(nowDate).utc());
    const isEnd = moment(activityInfo.end_time)
      .utc()
      .isSameOrBefore(moment(nowDate).utc());
    if (noStart || isEnd) {
      this.logger.log(`nostart, ${noStart}, 'isEnd', ${isEnd}`);
      return false;
    }
    return true;
  }
  //从redis获取已经发送奖励的数值
  public async getAwardValueCache(actKey) {
    const bean = `Event Rewards:${actKey}:bean`;
    const gem = `Event Rewards:${actKey}:gem`;
    const gold = `Event Rewards:${actKey}:gold`;
    //用Promise.all 会导致redis连接数过多，所以用await
    const beanValue = await this.cacheManage.get(bean);
    const gemValue = await this.cacheManage.get(gem);
    const goldValue = await this.cacheManage.get(gold);
    // 单位换算规则 1beans=2gems=100 golds  单位统一转化成beans
    const beanNum = beanValue ? +beanValue : 0;
    const gemNum = gemValue ? +gemValue / 2 : 0;
    const goldNum = goldValue ? +goldValue / 100 : 0;
    return beanNum + gemNum + goldNum;
  }
  public getTimekeyByDate(curTime, cond, actInfo) {
    let timeUnique = '';
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
    return timeUnique;
  }

  public preTimesCacheKey(userId, curTime, cond, actInfo) {
    const timeUnique = this.getTimekeyByDate(curTime, cond, actInfo);
    return `cache:preTimes:${userId}:${cond.id}:${timeUnique}`;
  }
  public async getPreTimesCache(userId, curTime, cond, actInfo) {
    const ret = await this.cacheManage.get(
      this.preTimesCacheKey(userId, curTime, cond, actInfo)
    );
    return ret ? +ret : 0;
  }
  public async setPreTimesCache(userId, curTime, cond, actInfo, times) {
    const condTtl = this.getConditionTtl(cond, actInfo);
    return await this.cacheManage.set(
      this.preTimesCacheKey(userId, curTime, cond, actInfo),
      times,
      {
        ttl: +condTtl + 2 * 24 * 60 * 60, //加2天，防止时间误差
      }
    );
  }
}
