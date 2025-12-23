import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { RankingSource, RankingType } from '../common/enum';
import { Base } from './base';
import { RankingRuleEntity } from './ranking.config.entity';

@Entity('ranking_result')
export class RankingResultEntity extends Base {
  @Column({
    name: 'bus_user_id',
    comment: '业务用户Id', //
  })
  busUserId: string;
  @ManyToOne(() => RankingRuleEntity)
  @JoinColumn({
    name: 'ranking_rule_id',
  })
  rankingRule?: Relation<RankingRuleEntity>;
  @Column({
    name: 'amount',
    comment: '统计的数量', //积分，经验，充值金额
  })
  amount: number;
  @Column({
    type: 'char',
    length: 20,
    default: null,
  })
  type: RankingType;
  @Column({
    type: 'char',
    length: 20,
    default: null,
  })
  source?: RankingSource;
  @Column({
    type: 'simple-json',
    default: null,
  })
  ext: JSON; //扩展字段
  @Column({
    name: 'period_key',
  })
  periodKey: string;
  @Column({
    name: 'last_time',
    default: 0,
  })
  last_time: number;
}
