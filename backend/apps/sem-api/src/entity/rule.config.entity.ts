import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  type Relation,
} from 'typeorm';
import type { ActivityEntity } from './activities.entity';
import { Base } from './base';
import { DataSourceEntity } from './datasource.entity';

@Entity('rule_config')
export class RuleConfigEntity extends Base {
  @Column({
    comment: '规则名称',
  })
  name?: string;
  @ManyToOne(() => DataSourceEntity)
  @JoinColumn({
    name: 'source_id',
  })
  source?: DataSourceEntity;
  @ManyToMany('ActivityEntity', (t: ActivityEntity) => t.ruleConfig)
  @JoinTable({
    name: 'activity_rule_map',
    joinColumn: {
      name: 'rule_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'activity_id',
      referencedColumnName: 'id',
    },
  })
  activity: Relation<ActivityEntity>[];
  @Column({
    comment: '规则类型',
    nullable: true,
  })
  type?: string;
  @Column({
    comment: '规则配置',
    type: 'text',
  })
  config?: string;
  @Column({
    comment: '数据源描述',
    default: '',
  })
  description?: string;
}
