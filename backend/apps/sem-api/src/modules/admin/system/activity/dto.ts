
import { TaskAccountType } from 'apps/sem-api/src/common/enum';
import type { ActivityEntity } from 'apps/sem-api/src/entity/activities.entity';
import type { TaskAwardInstanceEntity } from 'apps/sem-api/src/entity/activities.task.award';
import type { ActivityTaskEntity } from 'apps/sem-api/src/entity/activities.task.entity';
import type { RankingRuleEntity } from 'apps/sem-api/src/entity/ranking.config.entity';
import type { TaskConditionEntity } from 'apps/sem-api/src/entity/task.condition.entity';
import type { TaskEntity } from 'apps/sem-api/src/entity/task.entity';
import type { UserEntity } from 'apps/sem-api/src/entity/user.entity';

export class SaveTaskConditonDto {

  id?: number;

  conditions?: [];
  // @ApiPropertyOptional({
  //   type: () => TaskAwardInstanceEntity[],
  // })
  awardsInstance: TaskAwardInstanceEntity[];
}
export class ActivityTaskDto {

  id: number;

  // @IsNotEmpty({ message: '任务显示名称不能为空' })
  alias_name: string;
  // @IsNotEmpty({ message: '任务条件不能为空' })
  // @ApiPropertyOptional({
  //   type: () => [TaskConditionEntity],
  // })
  taskConditions: TaskConditionEntity[];
  dateTime?: [];

  start_time: string;

  end_time: string;
  // @ApiProperty({ type: () => TaskEntity })
  task: TaskEntity;
}

export class CreateActivityDto {

  id?: number;

  user: UserEntity;

  name: string;

  follow_email?: string;


  start_time: string;

  end_time: string;

  // @ValidateNested({ each: true, message: '任务数组ActivityTaskDto' })
  tasks: ActivityTaskDto[];

  account_type: TaskAccountType;

  custom_param: any;

  rankingRules: RankingRuleEntity[];
  ruleConfig: [];
}

export class CreateAwardCheckDto {}

export interface SaveAwardDto {
  taskCondition: TaskConditionEntity;
  actInfo: ActivityEntity;
  taskInfo: ActivityTaskEntity;
  userId: string;
  requestId?: string; //幂等id,
  times?: number; //当前次数
  totalTimes?: number; //总次数,
  targetValue?: any; //指标值，
  busTime?: string; //业务时间.
  batches?: number; //批量执行次数;
}

export interface ProbMapAward {
  probId: number;
  awards: TaskAwardInstanceEntity[];
}
export interface SrcAwardMap {
  prob: ProbMapAward[];
}

export interface SendMsgDto {
  userId: string;
  msg: string;
  msgTitle: string;
  msgUrl: string;
}

export class RunDayTaskQueryDto {

  actCode?: string;


  taskId?: string;


  runTime?: string;
}
