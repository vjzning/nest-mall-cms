import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
  RelationId,
} from 'typeorm';
import type { TaskAwardInstanceEntity } from './activities.task.award';
import type { AwardGroupEntity } from './award.group.entity';

export enum AwardGroupProbLimitType {
  NONE = 0,
  DAY = 1,
  WEEK = 2,
  MONTH = 3,
  TOTAl = 4,
}

@Entity('award_group_prob')
export class AwardGroupProbEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id?: number;
  @Column()
  name?: string;
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  percent?: number;
  @ManyToOne('AwardGroupEntity')
  @JoinColumn({
    name: 'parent_group_id',
  })
  awardGroup: Relation<AwardGroupEntity>;
  @RelationId('awardGroup')
  awardGroupId: number;
  @OneToMany('TaskAwardInstanceEntity', (v: TaskAwardInstanceEntity) => v.prob, {
    cascade: true,
    eager: true,
  })
  awardsInstance?: Relation<TaskAwardInstanceEntity>[];
  @OneToOne('AwardGroupEntity', {
    // eager: true,
  })
  @JoinColumn({
    name: 'children_group_id',
  })
  childrenAwardGroup: Relation<AwardGroupEntity>;
  @RelationId('childrenAwardGroup')
  childrenAwardGroupId: number;

  @Column({
    type: 'int',
    default: AwardGroupProbLimitType.NONE,
    name: 'limit_type',
    comment: '限制类型',
  })
  limitType?: AwardGroupProbLimitType;
  @Column({
    type: 'int',
    default: null,
    name: 'limit_times',
    comment: '周期内限制次数',
  })
  limitTimes?: number;
}
