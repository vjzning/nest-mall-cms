import { Column, Entity, JoinColumn, ManyToOne, type Relation } from 'typeorm';
import { Base } from './base';
import { BusinessBaseUserEntity } from './business.user.entity';
import { TagRuleEntity } from './tag.rule.entity';

@Entity('user_tag_map')
export class UserTagEntity extends Base {
  @JoinColumn({
    name: 'tag_id',
  })
  @ManyToOne(() => TagRuleEntity, {
    eager: true,
    createForeignKeyConstraints: false,
  })
  tag: Relation<TagRuleEntity>;
  @JoinColumn({
    name: 'user_id',
  })
  @ManyToOne(() => BusinessBaseUserEntity, {
    eager: true,
    createForeignKeyConstraints: false,
  })
  user: Relation<BusinessBaseUserEntity>;
  @Column('timestamp', {
    comment: '生效时间',
    name: 'start_time',
  })
  startTime;
  @Column('timestamp', {
    comment: '失效时间',
    name: 'end_time',
  })
  endTime;
  @Column('tinyint', {
    comment: '状态',
  })
  status: number;
  @Column({
    type: 'simple-json',
    name: 'ext_attr',
    comment: '扩展属性',
    default: null,
  })
  extAttr;
}
