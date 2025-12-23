import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  RelationId,
  type Relation,
} from 'typeorm';
import { AwardSendStatus } from '../common/enum';
import type { ActivityEntity } from './activities.entity';
import type { ActivityTaskEntity } from './activities.task.entity';
import type { AwardCheckInfoEntity } from './award.check';
import { Base } from './base';
import type { TaskConditionEntity } from './task.condition.entity';

@Entity('complate_task_user')
@Index('condition_reqid', ['taskCondition', 'requestId'], {
  unique: true,
})
export class CompleteTaskUserEntity extends Base {
  @Column({
    comment: '内部用户 ID',
    default: null,
  })
  userId?: number;
  @Column({
    type: 'varchar',
    name: 'bus_user_id',
    comment: '业务用户id',
    default: null,
  })
  @Index()
  busUserId?: string;
  @ManyToOne('ActivityTaskEntity')
  @JoinColumn({
    name: 'task_id',
  })
  taskInstance?: Relation<ActivityTaskEntity>;
  @RelationId('taskInstance')
  taskInstanceId?: number;
  @ManyToOne('TaskConditionEntity')
  @JoinColumn({
    name: 'task_condition_id',
  })
  taskCondition?: TaskConditionEntity;
  @RelationId('taskCondition')
  taskConditionId?: number;
  @Column({
    type: 'varchar',
    default: null,
  })
  targetValue?: any;
  @Column()
  times?: number;
  @Column({
    name: 'request_id',
    default: null,
  })
  requestId?: string;
  @Column({
    name: 'requestret',
    default: -1,
  })
  @Index()
  requestRet?: number;
  @Column({
    name: 'fail_cnt',
    default: 0,
  })
  failCnt?: number;
  @ManyToOne('ActivityEntity', {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'activity_id',
  })
  activity?: Relation<ActivityEntity>;
  @RelationId('activity')
  activityId?: number;
  @OneToMany('AwardCheckInfoEntity', (t: AwardCheckInfoEntity) => t.completeUser)
  checkInfo?: AwardCheckInfoEntity[];
  @RelationId('checkInfo')
  checkIds?: [];
  @Column({
    default: 1,
    name: 'complete_count',
    comment: '任务完成的次数',
  })
  completeCount?: number;

  @CreateDateColumn({
    type: 'timestamp',
    length: 0,
    comment: '业务时间',
    name: 'business_time',
  })
  businessTime?: string;
  @Column({
    name: 'is_sue',
    default: AwardSendStatus.Not,
    comment: '缓存奖励发送情况',
  })
  issue?: number;
}
