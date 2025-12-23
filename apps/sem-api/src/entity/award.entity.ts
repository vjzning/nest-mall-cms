import { Column, Entity, JoinColumn, ManyToOne, type Relation, RelationId } from 'typeorm';
import { AwardStatus, ResourceType } from '../common/enum';
import { Base } from './base';
import { CategoryAwardEntity } from './category.award.entity';

@Entity('award_info')
export class AwardEntity extends Base {
  @Column({
    type: 'varchar',
    length: 128,
    comment: '奖励名称',
  })
  name?: string;

  @ManyToOne(() => CategoryAwardEntity)
  @JoinColumn({ name: 'category_id' })
  category?: Relation<CategoryAwardEntity>;

  @RelationId((a: AwardEntity) => a.category) // 需要指定目标关系
  categoryId?: number;

  @Column({
    type: 'enum',
    enum: AwardStatus,
    default: AwardStatus.Online,
    comment: '1 上线,0 下线',
  })
  status?: AwardStatus;
  @Column({ type: 'text', name: 'key_id', comment: '对应业务 ID' })
  keyId?: string;
  @Column({
    name: 'key_type',
    comment: '业务奖励类型',
  })
  keyType?: string;
  @Column({
    name: 'num_attr',
    comment: '奖励是动态还是固定值',
    default: 1, //固定.
  })
  numAttr?: number;
  @Column({ type: 'integer', comment: '权重', default: 0 })
  weight?: number;

  @Column({ type: 'varchar', comment: '奖励分组名称', default: '' })
  group_name?: string;
  // @Column({ type: 'bool', default: false, comment: '是否需要审核' })
  // is_check?: boolean;
  @Column({ type: 'simple-json', default: null, comment: '用户自定义参数' })
  custom_param?: [{ name: string; value: string }];

  @Column({
    type: 'varchar',
    comment: '奖励图片',
  })
  image?: string;
  @Column({
    type: 'char',
    default: null,
    length: 20,
    comment: '奖励类型，对应的是一种用户资源的类型',
  })
  type?: ResourceType;
  @Column({
    comment: '奖励价值,单位beans',
    default: 0,
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  cost: number;
  @Column({
    comment: '奖励价值,类型',
    type: 'smallint',
    name: 'cost_type',
    default: null,
  })
  costType?: number;
}
