import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('notification_setting')
export class NotificationSettingEntity extends BaseEntity {
    @Column({
        length: 50,
        unique: true,
        comment: '通知类型 (如 STOCK_ZERO, ORDER_TIMEOUT, 或 DEFAULT)',
    })
    type: string;

    @Column({
        type: 'json',
        comment: '启用的渠道 (如 ["WEB", "EMAIL", "WECHAT"])',
    })
    channels: string[];

    @Column({ default: true, comment: '是否启用该类型的通知' })
    isEnabled: boolean;

    @Column({ length: 255, nullable: true, comment: '配置描述' })
    description: string;

    @Column({
        type: 'json',
        nullable: true,
        comment: '固定的接收邮箱列表 (针对 ADMIN 类型)',
    })
    adminEmails: string[];

    @Column({
        type: 'json',
        nullable: true,
        comment: '固定的接收管理员 ID 列表 (针对 ADMIN 类型)',
    })
    adminUserIds: number[];
}
