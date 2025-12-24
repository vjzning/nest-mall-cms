import { Column, Entity, Unique } from 'typeorm';
import { TagTarget, TagTimeZone } from '../common/enum';
import { Base } from './base';

@Entity('tag_rule')
@Unique('tag_name_unique', ['name'])
export class TagRuleEntity extends Base {
  @Column('varchar', {
    comment: '标签显示名称',
  })
  title?: string;
  @Column('varchar', {
    comment: '标签名称',
  })
  name?: string;
  @Column('text', {
    name: 'rule_config',
    comment: '标签规则配置',
  })
  ruleConfig?: string;
  @Column({
    type: 'enum',
    enum: TagTimeZone,
    name: 'time_zone',
    default: TagTimeZone.utc0,
  })
  timeZone?: TagTimeZone;
  @Column({
    type: 'enum',
    name: 'analyse_object',
    comment: '标签分析的目标属性',
    enum: TagTarget,
    default: TagTarget.User,
  })
  analyseTarget?: TagTarget;
  @Column('integer', {
    name: 'operator_state',
    comment: '算子状态',
    default: 0,
  })
  operatorState?: number;
  @Column('simple-json', {
    name: 'ext_attr',
    comment: '自定义扩展属性',
    default: null,
  })
  extAttr?: any;
  @Column('boolean', {
    name: 'is_online',
    comment: '是否启用',
    default: true,
  })
  isOnline?: boolean;

  @Column('varchar', { default: '' })
  remark?: string;
}
