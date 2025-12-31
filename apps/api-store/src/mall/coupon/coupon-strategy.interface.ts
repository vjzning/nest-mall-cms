import { Decimal } from 'decimal.js';
import {
    MallCouponEntity,
    CouponType,
} from '@app/db/entities/mall-coupon.entity';

export interface CouponMatchContext {
    memberId: number;
    items: {
        productId: number;
        categoryId: number;
        price: Decimal;
        quantity: number;
    }[];
    totalAmount: Decimal;
}

export interface DiscountResult {
    discountAmount: Decimal;
    isFreeShipping: boolean;
}

export interface ICouponStrategy {
    canUse(coupon: MallCouponEntity, context: CouponMatchContext): boolean;
    calculate(
        coupon: MallCouponEntity,
        context: CouponMatchContext
    ): DiscountResult;
}

export class FullReductionStrategy implements ICouponStrategy {
    canUse(coupon: MallCouponEntity, context: CouponMatchContext): boolean {
        return context.totalAmount.gte(coupon.minAmount);
    }

    calculate(
        coupon: MallCouponEntity,
        context: CouponMatchContext
    ): DiscountResult {
        return {
            discountAmount: new Decimal(coupon.value),
            isFreeShipping: false,
        };
    }
}

export class DiscountStrategy implements ICouponStrategy {
    canUse(coupon: MallCouponEntity, context: CouponMatchContext): boolean {
        return context.totalAmount.gte(coupon.minAmount);
    }

    calculate(
        coupon: MallCouponEntity,
        context: CouponMatchContext
    ): DiscountResult {
        // 0.85 means 15% off
        const discount = context.totalAmount.times(
            new Decimal(1).minus(coupon.value)
        );
        return {
            discountAmount: discount,
            isFreeShipping: false,
        };
    }
}

export class FreeShippingStrategy implements ICouponStrategy {
    canUse(coupon: MallCouponEntity, context: CouponMatchContext): boolean {
        return context.totalAmount.gte(coupon.minAmount);
    }

    calculate(
        coupon: MallCouponEntity,
        context: CouponMatchContext
    ): DiscountResult {
        return {
            discountAmount: new Decimal(0),
            isFreeShipping: true,
        };
    }
}

export class CouponStrategyFactory {
    static getStrategy(type: CouponType): ICouponStrategy {
        switch (type) {
            case CouponType.CASH:
                return new FullReductionStrategy();
            case CouponType.DISCOUNT:
                return new DiscountStrategy();
            case CouponType.FREE_POST:
                return new FreeShippingStrategy();
            default:
                throw new Error(`Unsupported coupon type: ${type}`);
        }
    }
}
