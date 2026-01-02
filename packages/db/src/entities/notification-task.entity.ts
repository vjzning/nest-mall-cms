import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('notification_tasks')
export class NotificationTaskEntity extends BaseEntity {
  @Column({ type: 'bigint', comment: '关联的通知ID' })
  @Index()
  notificationId: number;

  @Column({ type: 'varchar', length: 20, comment: '发送渠道: WEB, WECHAT, EMAIL' })
  channel: string;

  @Column({ type: 'tinyint', default: 0, comment: '发送状态: 0(待发送), 1(发送中), 2(发送成功), 3(发送失败)' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  error: string;

  @Column({ type: 'timestamp', nullable: true, comment: '发送时间' })
  sentAt: Date;

  @Column({ type: 'int', default: 0, comment: '重试次数' })
  retryCount: number;

  @Column({ type: 'json', nullable: true, comment: '渠道特定的响应数据' })
  response: any;
}
