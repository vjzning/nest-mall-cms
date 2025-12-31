import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MallCouponEntity } from './mall-coupon.entity';
import { MemberEntity } from './member.entity';

/**
 * 会员优惠券状态
 */
export enum MemberCouponStatus {
  UNUSED = 1,    // 未使用
  USED = 2,      // 已使用
  EXPIRED = 3,   // 已过期
  LOCKED = 4     // 已锁定/下单中
}

@Entity('mall_member_coupon')
export class MallMemberCouponEntity extends BaseEntity {
  @Column({ name: 'member_id', type: 'bigint' })
  memberId: number;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @Column({ name: 'coupon_id', type: 'bigint' })
  couponId: number;

  @ManyToOne(() => MallCouponEntity)
  @JoinColumn({ name: 'coupon_id' })
  coupon: MallCouponEntity;

  @Column({ name: 'order_id', type: 'bigint', nullable: true, comment: '关联订单 ID' })
  orderId: number;

  @Column({ type: 'tinyint', default: MemberCouponStatus.UNUSED, comment: '状态 (1: 未使用, 2: 已使用, 3: 已过期, 4: 已锁定/下单中)' })
  status: MemberCouponStatus;

  @Column({ name: 'used_at', type: 'datetime', nullable: true, comment: '使用时间' })
  usedAt: Date;

  @Column({ name: 'claim_time', type: 'datetime', comment: '领取时间' })
  claimTime: Date;

  @Column({ name: 'expire_time', type: 'datetime', comment: '该实例的具体过期时间' })
  expireTime: Date;
}
