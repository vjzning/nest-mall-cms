import { IsNotEmpty } from 'class-validator';
import {
  PrimaryGeneratedColumn,
  VersionColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  BeforeInsert,
  BeforeUpdate,
  RelationId,
  type Relation,
} from 'typeorm';
import { ConditionUnique } from '../common/enum';
import type { TaskAwardInstanceEntity } from './activities.task.award';
import type { ActivityTaskEntity } from './activities.task.entity';
import type { AwardGroupEntity } from './award.group.entity';
import type { TagAwardEntity } from './tag.award';
@Entity('task_condition', {
  orderBy: { id: 'ASC' },
})
export class TaskConditionEntity {
  @PrimaryGeneratedColumn()
  id?: number;
  @ManyToOne('ActivityTaskEntity')
  @JoinColumn({
    name: 'instance_task_id',
  })
  instanceTask?: ActivityTaskEntity;

  @RelationId('instanceTask') // 需要指定目标关系
  instanceTaskId?: number;

  @Column('simple-json', {
    default: null,
    comment: '任务条件',
  })
  conditions?: [];
  @OneToMany('TaskAwardInstanceEntity', (v: TaskAwardInstanceEntity) => v.taskCondition, {
    cascade: true,
    eager: true,
    createForeignKeyConstraints: false,
  })
  awardsInstance?: TaskAwardInstanceEntity[];
  //奖励组。
  @ManyToMany('AwardGroupEntity', {
    eager: true,
  })
  @JoinTable({
    name: 'task_condition_map_award_group',
    joinColumn: {
      name: 'task_condition_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'award_group_id',
      referencedColumnName: 'id',
    },
  })
  awardGroups: Relation<AwardGroupEntity>[];
  // completeUserIds?: string[];
  @OneToMany('TagAwardEntity', (v: TagAwardEntity) => v.condition, {
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  tagAwards: Relation<TagAwardEntity>[];
  isComplete?: boolean;
  @Column({
    type: 'boolean',
    default: false,
  })
  isCheck?: boolean;
  @Column({
    name: 'auto_send',
    default: false,
    comment: '是否手动发送奖励',
  })
  isAutoSend: boolean;
  /**
   * 条件完成次数限制。
   */
  @Column({
    type: 'varchar',
    length: 20,
    default: ConditionUnique.Normal,
    name: 'send_limit',
    comment: '条件周期限制',
  })
  sendLimit?: ConditionUnique;
  @Column({
    type: 'int',
    default: 0,
    name: 'send_limit_count',
    comment: '周期内完成条件的最大次数',
  })
  @IsNotEmpty()
  limitTimes?: number;
  @Column('integer', {
    default: 0,
  })
  sort?: number;
  @Column({
    type: 'simple-json',
    default: null,
    name: 'custom_param',
  })
  customParam: any;
  @BeforeInsert()
  @BeforeUpdate()
  beforeLimitTimes() {
    this.limitTimes = Number(this.limitTimes);
  }
  @VersionColumn({
    comment: '版本',
    default: 1,
  })
  version?: number;

  @Column({
    type: 'simple-json',
    default: null,
    name: 'condition_tags',
    comment: '标签',
  })
  conditionTags?: any;
}
