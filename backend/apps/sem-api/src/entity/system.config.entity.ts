import { Column, Entity } from 'typeorm';
import { Base } from './base';

@Entity('config')
export class SysConfigEntity extends Base {
  @Column('varchar', { comment: '系统名称' })
  name: string;
  @Column('longtext', { comment: '系统 logo base64' })
  logo: string;
  @Column({
    name: 'task_group',
    type: 'simple-json',
    default: null,
    comment: '任务实例分组数据源配置',
  })
  taskGroup: any;

  @Column('simple-json', { name: 'resource_type', default: null })
  resourceType: any;
  @Column('simple-json', { name: 'ranking_type', default: null })
  rankingType: any;
  @Column({
    name: 'lowcode_domain',
    comment: '微页面运行时域名',
  })
  lowcodeDomain: string;
  @Column('simple-json', { name: 'ext_config', default: null })
  extConfig: any;
}
