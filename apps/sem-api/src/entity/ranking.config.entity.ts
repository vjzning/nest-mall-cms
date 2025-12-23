import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { RankingSource, RankingType } from '../common/enum';
import type { ActivityEntity } from './activities.entity';
import { Base } from './base';

@Entity('ranking_rule')
export class RankingRuleEntity extends Base {
  @Column({
    name: 'name',
    comment: '榜单名称',
  })
  name?: string;
  @ManyToOne('ActivityEntity')
  @JoinColumn({
    name: 'activity_id',
  })
  activity?: Relation<ActivityEntity>;
  @Column({
    type: 'text',
  })
  rule?: string;
  @Column({
    type: 'char',
    length: 20,
    default: null,
  })
  period?: RankingType;
  @Column({
    type: 'varchar',
    // length: 40,
    default: null,
  })
  type?: RankingSource;
  @Column({
    default: 0,
  })
  status?: number;
  @Column()
  size?: number;
  @Column({
    type: 'simple-json',
    default: null,
    name: 'custom_param',
  })
  customParam: any;
}
