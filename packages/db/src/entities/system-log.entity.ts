import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_log')
export class SystemLogEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint', nullable: true, comment: '操作人ID' })
  userId: number;

  @Column({ name: 'user_type', length: 20, default: 'admin', comment: '用户类型: admin, member' })
  userType: string;

  @Column({ name: 'username', length: 50, nullable: true, comment: '操作人账号' })
  username: string;

  @Column({ length: 50, nullable: true, comment: '所属模块' })
  module: string;

  @Column({ length: 100, nullable: true, comment: '操作描述' })
  action: string;

  @Column({ length: 10, nullable: true, comment: '请求方式' })
  method: string;

  @Column({ length: 255, nullable: true, comment: '请求URL' })
  url: string;

  @Column({ length: 50, nullable: true, comment: '操作IP' })
  ip: string;

  @Column({ length: 100, nullable: true, comment: '操作地点' })
  location: string;

  @Column({ type: 'text', nullable: true, comment: '请求参数' })
  params: string;

  @Column({ type: 'text', nullable: true, comment: '请求体' })
  body: string;

  @Column({ type: 'text', nullable: true, comment: '响应结果' })
  response: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1成功, 0失败' })
  status: number;

  @Column({ name: 'error_msg', type: 'text', nullable: true, comment: '异常信息' })
  errorMsg: string;

  @Column({ type: 'int', default: 0, comment: '消耗时间(ms)' })
  duration: number;

  @Column({ name: 'user_agent', length: 500, nullable: true, comment: '浏览器UA' })
  userAgent: string;
}
