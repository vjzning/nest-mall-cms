export enum UserStatus {
  Normal = 1,
  Close = 0,
}

export enum TaskCycle {
  /**
   * 按天
   */
  Day = 1,
  /**
   * 按非然周
   */
  Week = 2,
  /**
   * 按月
   */
  Month = 3,
  /**
   * 执行一次
   */
  Permanent = 4,
  /**
   * 按自然周
   */
  NWeek = 5,
  /**
   * 自定义 Cron 表达式
   */
  CronExpression = 6,
}

export enum TaskAccountType {
  System = 1,
  QQ = 2,
  Weixin = 3,
  AppleId = 4,
  Mobile = 5,
}
export enum TaskScheduleMode {
  /**
   * Active 主动,
   */
  Active = 1,
  /**
   * Passive 被动,
   */
  Passive = 2,
}
export enum TaskStatus {
  Offline = 0,
  Online = 1,
}

export enum AwardStatus {
  Offline = 0,
  Online = 1,
}

export enum SwitchStatus {
  Yes = 1,
  No = 0,
}

export enum SuperAdmin {
  Yes = 1,
  No = 0,
}

export enum YesOrNo {
  Yes = '1',
  No = '0',
}
export enum AccessType {
  Module = 1,
  Menus = 2,
  Api = 3,
}

export enum DeployStatus {
  Unkown = 0,
  Ing = 1,
  Success = 2,
  Fail = 3,
}

export enum ActivityTimeStatus {
  NotStarted = 1,
  Ing = 2,
  Finish = 3,
}
export enum CheckStatus {
  Ing = 1,
  Success = 2,
  Fail = 3,
  No = 4,
}

export enum ConditionUnique {
  /**
   * 不限制，可以重复完成.
   */
  Normal = '0',
  /**
   * 活动期间每天只能完成x次
   */
  Day = '1',
  /**
   *  活动期间只能完成x次
   */
  Permanent = '2',
  /**
   * 活动期间自然周只能完成x次, //每年的1月1日为第一周的开始
   */
  Week = '3',

  /**
   * 活动期间非自然周只能完成x次， //任意开始时间为第一周的开始
   */
  NWeek = '4',
  /**
   * 活动期间按月完成x次
   */
  Month = '5',
  /**
   * 活动期间，每自然小时可以完成
   */
  Hour = '6',
  Year = '7',
  WeekOfMonth = '8', //每月1号为第一周的开始， 29号后。不算了
}

//活动类资源类型
export enum ResourceType {
  Out = 'Out', //外部业务类型
  Level = 'Level', //当前活动等级,
  Experience = 'Experience', //当前活动经验,
  Integration = 'Integration', //当前活动积分,
  Balance = 'Balance', //当前活动余额,
  Game = 'Game', //游戏机会
}

//榜单类型
export enum RankingType {
  Hour = 'hour', //每小时榜单,
  Day = 'day', //每日榜单,
  Week = 'week', //
  Month = 'month', //
  Total = 'total', //总榜单,
  // 每月中的周榜单
  WeekOfMonth = 'week_of_month',
  //...
}
export enum RankingSource {
  SendGift = 'send_gift_rank', //送礼榜单,
  ReceiveGift = 'receive_gift_rank', //收礼榜单,
  // Level = '3', //等级榜单,
  // Experience = '4', //经验榜单,
}

//指标类型
export enum TargetType {
  Url = 'url',
  Event = 'event',
  Lambda = 'lambda',
  Fixed = 'fixed',
  Function = 'function',
}

export enum TagTarget {
  User = 1,
  Device = 2,
  Ip = 3,
  ProxyId = 4,
}
export enum TagTimeZone {
  local = 0,
  utc0 = 1,
  utc8 = 2,
}

export enum TaskTiming {
  AwardSend = 1,
  TaskFinish = 2,
}

export enum AwardSendStatus {
  All = 1,
  Not = 2,
  Part = 3,
}
export enum AwardNumberType {
  Fixed = 1,
  Dynamic = 2,
}
