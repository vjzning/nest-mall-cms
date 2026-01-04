import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MemberEntity } from './member.entity';
import { MallOrderItemEntity } from './mall-order-item.entity';
import type { MallDeliveryEntity } from './mall-delivery.entity';

export enum OrderStatus {
    PENDING_PAY = 'PENDING_PAY',
    PENDING_DELIVERY = 'PENDING_DELIVERY',
    PARTIALLY_SHIPPED = 'PARTIALLY_SHIPPED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

@Entity('mall_order')
export class MallOrderEntity extends BaseEntity {
    @Column({ length: 50, unique: true, name: 'order_no' })
    orderNo: string;

    @Column({ name: 'member_id', type: 'bigint' })
    memberId: number;

    @ManyToOne(() => MemberEntity)
    @JoinColumn({ name: 'member_id' })
    member: MemberEntity;

    @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ name: 'pay_amount', type: 'decimal', precision: 10, scale: 2 })
    payAmount: number;

    @Column({ name: 'shipping_fee', type: 'decimal', precision: 10, scale: 2, default: 0, comment: '运费' })
    shippingFee: number;

    @Column({ type: 'varchar', length: 20, default: OrderStatus.PENDING_PAY })
    status: OrderStatus;

    @Column({ type: 'json', nullable: true, name: 'receiver_info' })
    receiverInfo: any;

    @Column({ name: 'paid_at', type: 'datetime', nullable: true })
    paidAt: Date;

    @Column({
        name: 'transaction_id',
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    transactionId: string;

    @Column({
        name: 'remark',
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '订单备注',
    })
    remark?: string;

    @Column({ name: 'activity_id', type: 'bigint', nullable: true, comment: '秒杀活动ID' })
    activityId?: number;

    @OneToMany(() => MallOrderItemEntity, (item) => item.order)
    items: MallOrderItemEntity[];

    @OneToMany(
        'MallDeliveryEntity',
        (delivery: MallDeliveryEntity) => delivery.order
    )
    deliveries: MallDeliveryEntity[];
}
