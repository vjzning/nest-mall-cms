import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MallCouponEntity } from './mall-coupon.entity';

@Entity('mall_coupon_scope')
export class MallCouponScopeEntity extends BaseEntity {
  @Column({ name: 'coupon_id', type: 'bigint' })
  couponId: number;

  @ManyToOne(() => MallCouponEntity)
  @JoinColumn({ name: 'coupon_id' })
  coupon: MallCouponEntity;

  @Column({ name: 'target_id', type: 'bigint', comment: '目标 ID (分类 ID 或 商品 ID)' })
  targetId: number;
}
