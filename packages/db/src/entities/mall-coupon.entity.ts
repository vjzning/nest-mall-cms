import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

/**
 * 优惠券类型
 */
export enum CouponType {
  CASH = 1,     // 满减
  DISCOUNT = 2, // 折扣
  FREE_POST = 3 // 免邮
}

/**
 * 优惠券分类
 */
export enum CouponCategory {
  PLATFORM = 1, // 平台券
  SHOP = 2      // 店铺券/类目券
}

/**
 * 适用范围
 */
export enum CouponScopeType {
  ALL = 1,      // 全场通用
  CATEGORY = 2, // 指定分类
  PRODUCT = 3   // 指定商品
}

/**
 * 有效期类型
 */
export enum CouponValidityType {
  FIXED_RANGE = 1, // 固定时间范围
  DAYS_AFTER_CLAIM = 2 // 领取后 N 天内有效
}

/**
 * 优惠券状态
 */
export enum CouponStatus {
  OFF_SHELF = 0, // 下架/草稿
  ACTIVE = 1,    // 进行中
  ENDED = 2      // 已结束
}

@Entity('mall_coupon')
export class MallCouponEntity extends BaseEntity {
  @Column({ length: 100, comment: '优惠券名称' })
  name: string;

  @Column({ type: 'tinyint', comment: '优惠券类型 (1: 满减, 2: 折扣, 3: 免邮)' })
  type: CouponType;

  @Column({ type: 'tinyint', default: CouponCategory.PLATFORM, comment: '优惠券分类 (1: 平台券, 2: 店铺券/类目券)' })
  category: CouponCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '面值（金额或折扣比例，如 0.85 表示 85 折）' })
  value: number;

  @Column({ name: 'min_amount', type: 'decimal', precision: 10, scale: 2, default: 0, comment: '最低消费门槛' })
  minAmount: number;

  @Column({ name: 'scope_type', type: 'tinyint', default: CouponScopeType.ALL, comment: '适用范围 (1: 全场通用, 2: 指定分类, 3: 指定商品)' })
  scopeType: CouponScopeType;

  @Column({ name: 'is_stackable', type: 'boolean', default: false, comment: '是否可叠加' })
  isStackable: boolean;

  @Column({ name: 'stacking_rules', type: 'json', nullable: true, comment: '叠加规则 JSON' })
  stackingRules: any;

  @Column({ name: 'total_quantity', type: 'int', default: -1, comment: '发行总量 (-1 表示无限制)' })
  totalQuantity: number;

  @Column({ name: 'remaining_quantity', type: 'int', default: -1, comment: '剩余数量' })
  remainingQuantity: number;

  @Column({ name: 'user_limit', type: 'int', default: 1, comment: '每人限领张数' })
  userLimit: number;

  @Column({ name: 'validity_type', type: 'tinyint', default: CouponValidityType.FIXED_RANGE, comment: '有效期类型 (1: 固定时间范围, 2: 领取后 N 天内有效)' })
  validityType: CouponValidityType;

  @Column({ name: 'start_time', type: 'datetime', nullable: true, comment: '固定有效期开始时间' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true, comment: '固定有效期结束时间' })
  endTime: Date;

  @Column({ name: 'valid_days', type: 'int', nullable: true, comment: '领取后有效天数' })
  validDays: number;

  @Column({ type: 'tinyint', default: CouponStatus.OFF_SHELF, comment: '状态 (0: 下架/草稿, 1: 进行中, 2: 已结束)' })
  status: CouponStatus;
}
