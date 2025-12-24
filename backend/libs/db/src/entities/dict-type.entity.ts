import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_dict_type')
export class DictTypeEntity extends BaseEntity {
  @Column({ comment: '字典名称' })
  name: string;

  @Column({ unique: true, comment: '字典类型编码' })
  code: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态 1:启用 0:禁用' })
  status: number;

  @Column({ nullable: true, comment: '备注' })
  remark: string;
}
