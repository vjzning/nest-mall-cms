import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MemberEntity } from './member.entity';
import { MallOrderEntity } from './mall-order.entity';
import { MallAfterSaleItemEntity } from './mall-after-sale-item.entity';
import { MallAfterSaleLogisticsEntity } from './mall-after-sale-logistics.entity';

export enum AfterSaleType {
    REFUND_ONLY = 1, // 仅退款
    RETURN_AND_REFUND = 2, // 退货退款
    EXCHANGE = 3, // 换货
}

export enum AfterSaleStatus {
    APPLIED = 'APPLIED', // 已申请
    APPROVED = 'APPROVED', // 审核通过
    REJECTED = 'REJECTED', // 审核驳回
    WAITING_RECEIPT = 'WAITING_RECEIPT', // 待收货（用户已寄回）
    PROCESSING = 'PROCESSING', // 处理中
    REFUNDED = 'REFUNDED', // 已退款
    COMPLETED = 'COMPLETED', // 已完成
    CANCELLED = 'CANCELLED', // 已取消
}

@Entity('mall_after_sale')
export class MallAfterSaleEntity extends BaseEntity {
    @Column({ length: 50, unique: true, name: 'after_sale_no' })
    afterSaleNo: string;

    @Column({ name: 'order_id', type: 'bigint' })
    orderId: number;

    @ManyToOne(() => MallOrderEntity)
    @JoinColumn({ name: 'order_id' })
    order: MallOrderEntity;

    @Column({ length: 50, name: 'order_no' })
    orderNo: string;

    @Column({ name: 'member_id', type: 'bigint' })
    memberId: number;

    @ManyToOne(() => MemberEntity)
    @JoinColumn({ name: 'member_id' })
    member: MemberEntity;

    @Column({ type: 'int', default: AfterSaleType.REFUND_ONLY })
    type: AfterSaleType;

    @Column({ type: 'varchar', length: 20, default: AfterSaleStatus.APPLIED })
    status: AfterSaleStatus;

    @Column({ name: 'apply_reason', length: 200 })
    applyReason: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'json', nullable: true })
    images: string[];

    @Column({ name: 'apply_amount', type: 'decimal', precision: 10, scale: 2 })
    applyAmount: number;

    @Column({
        name: 'actual_amount',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
    })
    actualAmount: number;

    @Column({ name: 'admin_remark', length: 500, nullable: true })
    adminRemark: string;

    @Column({ name: 'handle_time', type: 'datetime', nullable: true })
    handleTime: Date;

    @OneToMany(() => MallAfterSaleItemEntity, (item) => item.afterSale)
    items: MallAfterSaleItemEntity[];

    @OneToMany(
        () => MallAfterSaleLogisticsEntity,
        (logistics) => logistics.afterSale
    )
    logistics: MallAfterSaleLogisticsEntity[];
}
