import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_dict_data')
export class DictDataEntity extends BaseEntity {
  @Column({ name: 'type_code', comment: '字典类型编码' })
  typeCode: string;

  @Column({ comment: '字典标签' })
  label: string;

  @Column({ comment: '字典键值' })
  value: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ name: 'is_default', type: 'boolean', default: false, comment: '是否默认' })
  isDefault: boolean;

  @Column({ type: 'tinyint', default: 1, comment: '状态 1:启用 0:禁用' })
  status: number;

  @Column('simple-json', { nullable: true, comment: '扩展属性' })
  meta: any;

  @Column({ nullable: true, comment: '备注' })
  remark: string;
}
