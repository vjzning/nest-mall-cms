import { Column, Entity, OneToMany, Relation } from 'typeorm';
import type { AwardGroupProbEntity } from './award.group.prob.entity';
import { Base } from './base';

@Entity('award_group')
export class AwardGroupEntity extends Base {
  @Column()
  name?: string;
  @Column()
  image?: string;
  @Column({
    default: '',
  })
  description?: string;
  // @Column({
  //   comment: '概率档位',
  // })
  @OneToMany('AwardGroupProbEntity', (v: AwardGroupProbEntity) => v.awardGroup, {
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  probLevelAwards: Relation<AwardGroupProbEntity>[];
}
