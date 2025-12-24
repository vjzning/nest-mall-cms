import { AccessEntity } from './access.entity';
import { AccessTokenEntity } from './access.token.entity';
import { ActivityDraftEntity } from './activities.draft.entity';
import { ActivityEntity } from './activities.entity';
import { TaskAwardInstanceEntity } from './activities.task.award';
import { ActivityTaskEntity } from './activities.task.entity';
import { AwardCheckInfoEntity } from './award.check';
import { AwardEntity } from './award.entity';
import { AwardGroupEntity } from './award.group.entity';
import { AwardGroupProbEntity } from './award.group.prob.entity';
import { BusinessTargetEntity } from './business.arget.entity';
import { CategoryAwardEntity } from './category.award.entity';
import { CategoryTaskEntity } from './category.task.entity';
import { CompleteTaskUserEntity } from './complete.task.user.entity';
import { DataSourceEntity } from './datasource.entity';
import { LowcodeBlockEntity } from './lowcode.block';
import { LowcodePageEntity } from './lowcode.page.entity';
import { OperationLogEntity } from './operation.log.entity';
import { OutUserEntity } from './outuser.entity';
import { RankingRuleEntity } from './ranking.config.entity';
import { RankingResultEntity } from './ranking.result.entity';
import { RoleEntity } from './role.entity';
import { RuleConfigEntity } from './rule.config.entity';
import { SysConfigEntity } from './system.config.entity';
import { TaskConditionEntity } from './task.condition.entity';
import { TaskEntity } from './task.entity';
import { UserEntity } from './user.entity';

import { BusinessBaseUserEntity } from './business.user.entity';
import { TagRuleEntity } from './tag.rule.entity';
import { UserTagEntity } from './tag.rule.user.entity';
import { TagAwardEntity } from './tag.award';
import { UserResouceEntity } from './user.resource';
import { WarningNoticeEntity } from './warning.notice.entity';
export default [
  UserEntity,
  RoleEntity,
  AccessEntity,
  TaskEntity,
  CategoryTaskEntity,
  CategoryAwardEntity,
  AwardEntity,
  ActivityEntity,
  TaskAwardInstanceEntity,
  ActivityTaskEntity,
  SysConfigEntity,
  // // RecommendRules,
  BusinessTargetEntity,
  OperationLogEntity,
  AwardCheckInfoEntity,
  AccessTokenEntity,
  CompleteTaskUserEntity, // 完成任务用户
  TaskConditionEntity, // 活动任务条件
  ActivityDraftEntity, // 活动草稿
  OutUserEntity, // 外部用户
  RuleConfigEntity, //规则配置表，
  RankingResultEntity, //排行榜结果
  RankingRuleEntity, //生成榜单规则
  DataSourceEntity, //数据源,
  AwardGroupEntity, // 奖励分组
  AwardGroupProbEntity, //奖励分组中概率档位
  LowcodePageEntity,
  LowcodeBlockEntity,
  BusinessBaseUserEntity, //业务用户表
  TagRuleEntity,
  UserTagEntity,
  TagAwardEntity,
  UserResouceEntity,
  WarningNoticeEntity,
];
