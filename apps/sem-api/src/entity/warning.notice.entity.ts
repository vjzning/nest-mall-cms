import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum NotifyType {
  // Email = 1,
  // DingTalk = 2,
  EmailAndDingTalk = 1,
}
export enum WarningNotifyStatus {
  Normal = 0,
  Check = 1,
  Close = 2,
}
@Entity('warning_notice')
export class WarningNoticeEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    name: 'notify_key',
  })
  @Unique('uni_notify_key', ['notifyKey'])
  notifyKey: string;
  @Column({
    default: WarningNotifyStatus.Normal,
  })
  status: WarningNotifyStatus;
  // `is_notify` int(11) DEFAULT NULL COMMENT '是否已通知 0 否 1是预警一次 2是预警2次',
  @Column({
    name: 'is_notify',
    default: 0,
    type: 'int',
  })
  isNotify: number;
  @Column({
    name: 'notify_type',
    default: NotifyType.EmailAndDingTalk,
    type: 'int',
  })
  notifyType: NotifyType;
  @Column({
    name: 'risk_value',
    type: 'decimal',
    precision: 20,
    scale: 2,
    comment: '风险预警阈值',
  })
  riskValue: number;
  // `current_risk_value` decimal(20,2) DEFAULT NULL COMMENT '当前风险值',
  @Column({
    name: 'current_risk_value',
    type: 'decimal',
    precision: 20,
    scale: 2,
    default: null,
    comment: '当前风险值',
  })
  currentRiskValue: number;
  // `current_value` decimal(20,2) DEFAULT '0.00' COMMENT '当前值',
  @Column({
    name: 'current_value',
    type: 'decimal',
    precision: 20,
    scale: 2,
    default: 0,
    comment: '当前值',
  })
  currentValue: number;
  // `riskValueRate` decimal(20,2) DEFAULT '0.8' COMMENT '第一次预警的百分比 默认0.8',
  @Column({
    name: 'risk_value_rate',
    type: 'decimal',
    precision: 20,
    scale: 2,
    default: 0.8,
    comment: '第一次预警的百分比 默认0.8',
  })
  riskValueRate: number;
  // `create_time` timestamp NULL DEFAULT NULL,
  @CreateDateColumn({
    name: 'create_time',
    type: 'timestamp',
    default: null,
  })
  createTime: Date;
  // `update_time` timestamp NULL DEFAULT NULL,
  @UpdateDateColumn({
    name: 'update_time',
    type: 'timestamp',
    default: null,
  })
  updateTime: Date;
  // `extend` varchar(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '扩展字段',
  @Column({
    name: 'extend',
    type: 'varchar',
    length: 2048,
    comment: '扩展字段',
    default: null,
  })
  extend: string;
}
