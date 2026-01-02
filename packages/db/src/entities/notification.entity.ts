import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('notifications')
export class NotificationEntity extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 20,
        comment: '目标类型: USER(用户), ADMIN(管理员)',
    })
    targetType: 'USER' | 'ADMIN';

    @Column({
        type: 'bigint',
        nullable: true,
        comment: '目标ID (用户ID或管理员ID)',
    })
    targetId: number;

    @Column({
        type: 'varchar',
        length: 50,
        comment: '业务类型 (如: ORDER_PAID, STOCK_ZERO)',
    })
    type: string;

    @Column({
        type: 'varchar',
        length: 255,
        comment: '通知标题',
    })
    title: string;

    @Column({
        type: 'text',
        comment: '通知内容',
    })
    content: string;

    @Column({
        type: 'json',
        nullable: true,
        comment: '附加数据 (JSON格式)',
    })
    payload: any;

    @Column({
        type: 'tinyint',
        default: 0,
        comment: '是否已读: 0(未读), 1(已读)',
    })
    isRead: number;

    @Column({
        type: 'json',
        nullable: true,
        comment: '发送渠道配置 (如: ["WEB", "WECHAT"])',
    })
    channels: string[];
}
