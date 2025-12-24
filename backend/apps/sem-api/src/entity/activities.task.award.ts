import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { AwardEntity } from './award.entity';
import type { AwardGroupProbEntity } from './award.group.prob.entity';
import { Base } from './base';
import type { TagAwardEntity } from './tag.award';
import type { TaskConditionEntity } from './task.condition.entity';

@Entity('activities_task_award_instance', {
  orderBy: {
    id: 'ASC',
  },
})
export class TaskAwardInstanceEntity extends Base {
  @ManyToOne(() => AwardEntity, {
    eager: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'src_award_id',
  })
  award?: Relation<AwardEntity>;
  @Column({
    name: 'num_attr',
    default: 1,
  })
  numAttr?: number; //缓存奖励属性固定还是动态.
  @Column('varchar', {
    default: 0,
  })
  number?: number;
  @Column('int', { default: 0, comment: '升序' })
  sort?: number;
  @Column({
    type: 'simple-json',
    default: null,
    comment: '计算公式',
  })
  formula?: [
    {
      value?: number;
      paramValue?: any;
    },
  ];
  @Column({
    default: 0,
  })
  days?: number;

  @ManyToOne('TaskConditionEntity', (t: TaskConditionEntity) => t.awardsInstance, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'task_condition_id',
  })
  taskCondition?: Relation<TaskConditionEntity>;

  @ManyToOne('AwardGroupProbEntity', (t: AwardGroupProbEntity) => t.awardsInstance, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'group_prob_id',
  })
  prob?: Relation<AwardGroupProbEntity>;
  @ManyToOne('TagAwardEntity', {
    orphanedRowAction: 'delete',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'tag_award_id',
  })
  tagAward?: Relation<TagAwardEntity>;
  @Column({
    name: 'max_limit',
    default: 0,
  })
  maxLimit?: number;
}
