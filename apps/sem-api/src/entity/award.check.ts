import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { CheckStatus, YesOrNo } from '../common/enum';
import type { TaskAwardInstanceEntity } from './activities.task.award';
import { Base } from './base';
import type { CompleteTaskUserEntity } from './complete.task.user.entity';
import { UserEntity } from './user.entity';

@Entity('award_check_info')
// @Index(['task', 'activity', 'busUserId'], { unique: true })
export class AwardCheckInfoEntity extends Base {
  @ManyToOne('TaskAwardInstanceEntity', {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'award_id',
  })
  awardInstance?: Relation<TaskAwardInstanceEntity>;
  @Column({
    name: 'award_number',
    comment: '缓存计算后的奖励数量',
    type: 'int',
    default: 0,
  })
  awardNumber: number;

  @Column({
    name: 'award_days',
    comment: '缓存计算后的奖励时效',
    type: 'int',
    default: 0,
  })
  awardDays: number;
  @Column({
    type: 'enum',
    default: CheckStatus.Ing,
    name: 'check_status',
    enum: CheckStatus,
  })
  checkStatus?: CheckStatus;
  @Column({
    type: 'varchar',
    name: 'check_desc',
    comment: '审核信息',
    default: null,
  })
  checkDesc?: string;
  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'check_user_id',
  })
  checkUser?: Relation<UserEntity>;
  @Column({
    type: 'enum',
    name: 'is_sue',
    enum: YesOrNo,
    comment: '奖励是否发放给用户',
    default: YesOrNo.No,
  })
  issue?: YesOrNo;
  @ManyToOne('CompleteTaskUserEntity')
  @JoinColumn({
    name: 'complete_id',
  })
  completeUser?: Relation<CompleteTaskUserEntity>;
}
