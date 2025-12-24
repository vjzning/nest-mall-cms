import { Column, Entity } from 'typeorm';
import { Base } from './base';

@Entity('data_source')
export class DataSourceEntity extends Base {
  @Column({
    comment: '数据源名称',
  })
  name?: string;
  @Column({
    comment: '数据源类型',
    nullable: true,
  })
  type?: string;
  @Column({
    comment: '数据源配置',
    type: 'text',
  })
  config?: string;
  @Column({
    comment: '数据源描述',
    default: '',
  })
  description?: string;
}
