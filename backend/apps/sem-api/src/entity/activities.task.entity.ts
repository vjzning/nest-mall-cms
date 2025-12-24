//活动任务

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  type Relation,
  RelationId,
} from 'typeorm';
import { TaskTiming } from '../common/enum';
import type { ActivityEntity } from './activities.entity';
import { AwardEntity } from './award.entity';
import { Base } from './base';
import type { TagRuleEntity } from './tag.rule.entity';
import type { TaskConditionEntity } from './task.condition.entity';
import { TaskEntity } from './task.entity';

@Entity('activities_task')
export class ActivityTaskEntity extends Base {
  @ManyToOne('ActivityEntity', (t: ActivityEntity) => t.tasks, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'activity_id',
  })
  activity?: Relation<ActivityEntity>;

  @RelationId((task: ActivityTaskEntity) => task.activity) // 需要指定目标关系
  activityId?: number;
  @ManyToOne(() => TaskEntity, {
    eager: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'src_task_id',
  })
  task?: Relation<TaskEntity>;

  @Column('integer', {
    default: 0,
  })
  sort?: number;

  @Column({
    type: 'timestamp',
    comment: '任务在此活动中的开始时间',
  })
  @Index()
  start_time?: string;

  @Column({
    type: 'timestamp',
    comment: '任务在此活动中的结束时间',
  })
  @Index()
  end_time?: string;

  @OneToMany('TaskConditionEntity', (v: TaskConditionEntity) => v.instanceTask, {
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  taskConditions?: Relation<TaskConditionEntity>[];

  @Column({ type: 'integer', comment: '权重', default: 0 })
  weight?: number;

  @Column({ type: 'varchar', comment: '任务分组', default: '' })
  group_name?: string;

  @Column({
    type: 'varchar',
    length: 1024,
    comment: '任务跳转参数',
    default: '',
  })
  href_param?: string;

  @Column({ type: 'varchar', comment: '该活动展示名称', default: '' })
  alias_name?: string;

  //通知标题
  @Column({ type: 'varchar', comment: '通知标题', default: '' })
  noticeTitle?: string;
  //通知内容
  @Column({ type: 'varchar', comment: '通知内容', default: '' })
  noticeContent?: string;

  @Column({ type: 'varchar', comment: '通知Url', default: '' })
  noticeUrl?: string;

  runTime?: number; //时间戳

  @Column({
    type: 'int',
    default: TaskTiming.AwardSend,
    name: 'timing',
  })
  timing?: TaskTiming;
  @ManyToMany('TagRuleEntity', {
    eager: true,
  })
  @JoinTable({
    name: 'activity_task_tag_map',
    joinColumn: {
      name: 'task_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tagConfig?: Relation<TagRuleEntity>[];
}
