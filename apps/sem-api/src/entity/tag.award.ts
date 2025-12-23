import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import type { TaskAwardInstanceEntity } from './activities.task.award';
import type { TagRuleEntity } from './tag.rule.entity';
import type { TaskConditionEntity } from './task.condition.entity';
@Entity({
  name: 'tag_award',
  orderBy: {
    id: 'DESC',
  },
})
export class TagAwardEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToMany('TaskAwardInstanceEntity', (v: TaskAwardInstanceEntity) => v.tagAward, {
    cascade: true,
    eager: true,
    createForeignKeyConstraints: false,
  })
  awardsInstance?: Relation<TaskAwardInstanceEntity>[];

  @ManyToOne('TaskConditionEntity', (t: TaskConditionEntity) => t.tagAwards, {
    createForeignKeyConstraints: false,
    orphanedRowAction: 'delete',
  })
  @JoinColumn({
    name: 'task_condition_id',
  })
  condition: Relation<TaskConditionEntity>;
  @ManyToOne('TagRuleEntity', {
    eager: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({
    name: 'tag_rule_id',
  })
  tagRule: Relation<TagRuleEntity>;
}
