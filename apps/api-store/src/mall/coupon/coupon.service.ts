import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Repository,
    MoreThan,
    DataSource,
    In,
    LessThanOrEqual,
    MoreThanOrEqual,
} from 'typeorm';
import {
    MallCouponEntity,
    CouponStatus,
    CouponValidityType,
    CouponType,
    CouponScopeType,
} from '@app/db/entities/mall-coupon.entity';
import {
    MallMemberCouponEntity,
    MemberCouponStatus,
} from '@app/db/entities/mall-member-coupon.entity';
import { MallCouponScopeEntity } from '@app/db/entities/mall-coupon-scope.entity';
import { RedisLockService } from '@app/redis/lock/redis-lock.service';
import { addDays, endOfDay } from 'date-fns';
import { Decimal } from 'decimal.js';
import {
    CouponMatchContext,
    CouponStrategyFactory,
    DiscountResult,
} from './coupon-strategy.interface';

@Injectable()
export class CouponService {
    constructor(
        @InjectRepository(MallCouponEntity)
        private readonly couponRepository: Repository<MallCouponEntity>,
        @InjectRepository(MallMemberCouponEntity)
        private readonly memberCouponRepository: Repository<MallMemberCouponEntity>,
        @InjectRepository(MallCouponScopeEntity)
        private readonly couponScopeRepository: Repository<MallCouponScopeEntity>,
        private readonly redisLockService: RedisLockService,
        private readonly dataSource: DataSource
    ) {}

    /**
     * 获取可领取的优惠券列表
     */
    async findAllAvailable() {
        const now = new Date();
        return await this.couponRepository
            .createQueryBuilder('coupon')
            .where('coupon.status = :status', { status: CouponStatus.ACTIVE })
            .andWhere(
                '(coupon.startTime IS NULL OR coupon.startTime <= :now)',
                { now }
            )
            .andWhere('(coupon.endTime IS NULL OR coupon.endTime >= :now)', {
                now,
            })
            .andWhere(
                '(coupon.remainingQuantity = -1 OR coupon.remainingQuantity > 0)'
            )
            .getMany();
    }

    /**
     * 领取优惠券
     */
    async claim(memberId: number, couponId: number) {
        const lockKey = `coupon_claim:${couponId}:${memberId}`;

        // 使用 lock 方法，如果锁被占用会抛出超时异常，或者我们可以用 lockOnce
        const locked = await this.redisLockService.lockOnce(lockKey, 5000);
        if (!locked) {
            throw new BadRequestException('操作过于频繁，请稍后再试');
        }

        try {
            return await this.dataSource.transaction(async (manager) => {
                // 1. 校验优惠券是否存在且在有效期内
                const coupon = await manager.findOne(MallCouponEntity, {
                    where: { id: couponId },
                    lock: { mode: 'pessimistic_write' }, // 数据库行锁确保库存不超发
                });

                if (!coupon || coupon.status !== CouponStatus.ACTIVE) {
                    throw new NotFoundException('优惠券不存在或已下架');
                }

                const now = new Date();
                if (coupon.startTime && coupon.startTime > now) {
                    throw new BadRequestException('活动尚未开始');
                }
                if (coupon.endTime && coupon.endTime < now) {
                    throw new BadRequestException('活动已结束');
                }

                // 2. 校验库存
                if (
                    coupon.totalQuantity !== -1 &&
                    coupon.remainingQuantity <= 0
                ) {
                    throw new BadRequestException('优惠券已领完');
                }

                // 3. 校验个人领取限制
                const claimCount = await manager.count(MallMemberCouponEntity, {
                    where: { memberId, couponId },
                });
                if (claimCount >= coupon.userLimit) {
                    throw new BadRequestException(
                        `每个用户限领 ${coupon.userLimit} 张`
                    );
                }

                // 4. 扣减库存
                if (coupon.totalQuantity !== -1) {
                    coupon.remainingQuantity -= 1;
                    await manager.save(coupon);
                }

                // 5. 生成会员优惠券
                let expireTime: Date;
                if (coupon.validityType === CouponValidityType.FIXED_RANGE) {
                    expireTime = coupon.endTime;
                } else {
                    expireTime = endOfDay(
                        addDays(new Date(), coupon.validDays)
                    );
                }

                const memberCoupon = manager.create(MallMemberCouponEntity, {
                    memberId,
                    couponId,
                    claimTime: now,
                    expireTime,
                    status: MemberCouponStatus.UNUSED,
                });

                return await manager.save(memberCoupon);
            });
        } finally {
            await this.redisLockService.unlock(lockKey);
        }
    }

    /**
     * 获取我的优惠券
     */
    async findMyCoupons(memberId: any, status?: MemberCouponStatus) {
        const mid = Number(memberId);
        const qb = this.memberCouponRepository
            .createQueryBuilder('mc')
            .leftJoinAndSelect('mc.coupon', 'coupon')
            .where('mc.member_id = :memberId', { memberId: mid });

        if (status) {
            qb.andWhere('mc.status = :status', { status });
        }

        qb.orderBy('mc.claimTime', 'DESC');
        return await qb.getMany();
    }

    /**
     * 匹配订单可用的优惠券
     */
    async matchAvailableCoupons(memberId: any, context: CouponMatchContext) {
        const mid = Number(memberId);
        console.log(
            `Matching coupons for member ${mid}, context:`,
            JSON.stringify(context)
        );
        // 确保 totalAmount 是 Decimal
        const totalAmount = new Decimal(context.totalAmount);
        const items = context.items.map((item) => ({
            ...item,
            price: new Decimal(item.price),
        }));

        // 1. 获取用户所有未使用的、未过期的优惠券
        const now = new Date();
        const memberCoupons = await this.memberCouponRepository.find({
            where: {
                memberId: mid,
                status: MemberCouponStatus.UNUSED,
                expireTime: MoreThan(now),
            },
            relations: ['coupon'],
        });

        console.log(
            `Found ${memberCoupons.length} unused coupons for member ${memberId}`
        );

        if (memberCoupons.length === 0) return [];

        const availableCoupons: any[] = [];

        for (const mc of memberCoupons) {
            const coupon = mc.coupon;
            console.log(
                `Checking coupon: ${coupon.name}, status: ${coupon.status}, scope: ${coupon.scopeType}`
            );

            // 2. 基础条件校验 (状态、时间)
            if (coupon.status !== CouponStatus.ACTIVE) {
                console.log(
                    `Coupon ${coupon.name} is not active (status: ${coupon.status})`
                );
                continue;
            }

            // 3. 适用范围校验
            let isScopeMatched = true;
            let scopeAmount = new Decimal(0);

            if (coupon.scopeType === CouponScopeType.ALL) {
                scopeAmount = totalAmount;
                console.log(
                    `Coupon ${coupon.name} is ALL scope, scopeAmount: ${scopeAmount}`
                );
            } else {
                // 获取该优惠券的所有适用范围
                const scopes = await this.couponScopeRepository.find({
                    where: { couponId: Number(coupon.id) },
                });
                const targetIds = scopes.map((s) => Number(s.targetId));
                console.log(`Coupon ${coupon.name} targetIds:`, targetIds);

                if (coupon.scopeType === CouponScopeType.CATEGORY) {
                    // 匹配分类
                    const matchedItems = items.filter((item) =>
                        targetIds.includes(item.categoryId)
                    );
                    if (matchedItems.length === 0) {
                        isScopeMatched = false;
                        console.log(`Coupon ${coupon.name} category mismatch`);
                    } else {
                        scopeAmount = matchedItems.reduce(
                            (sum, item) =>
                                sum.plus(item.price.times(item.quantity)),
                            new Decimal(0)
                        );
                        console.log(
                            `Coupon ${coupon.name} category matched, scopeAmount: ${scopeAmount}`
                        );
                    }
                } else if (coupon.scopeType === CouponScopeType.PRODUCT) {
                    // 匹配商品
                    const matchedItems = items.filter((item) =>
                        targetIds.includes(item.productId)
                    );
                    if (matchedItems.length === 0) {
                        isScopeMatched = false;
                        console.log(`Coupon ${coupon.name} product mismatch`);
                    } else {
                        scopeAmount = matchedItems.reduce(
                            (sum, item) =>
                                sum.plus(item.price.times(item.quantity)),
                            new Decimal(0)
                        );
                        console.log(
                            `Coupon ${coupon.name} product matched, scopeAmount: ${scopeAmount}`
                        );
                    }
                }
            }

            if (!isScopeMatched) continue;

            // 4. 门槛校验 (使用 scopeAmount 而不是 totalAmount)
            const strategy = CouponStrategyFactory.getStrategy(coupon.type);
            const tempContext = { ...context, totalAmount: scopeAmount, items };

            const canUse = strategy.canUse(coupon, tempContext);
            console.log(
                `Coupon ${coupon.name} strategy canUse: ${canUse}, threshold: ${coupon.minAmount}`
            );

            if (canUse) {
                const result = strategy.calculate(coupon, tempContext);
                availableCoupons.push({
                    memberCouponId: mc.id,
                    couponId: coupon.id,
                    name: coupon.name,
                    type: coupon.type,
                    value: coupon.value,
                    discountAmount: result.discountAmount.toNumber(),
                    isFreeShipping: result.isFreeShipping,
                    category: coupon.category,
                    isStackable: coupon.isStackable,
                });
            }
        }

        // 排序：按优惠金额降序
        return availableCoupons.sort(
            (a, b) => b.discountAmount - a.discountAmount
        );
    }

    /**
     * 校验并计算特定优惠券的优惠金额
     */
    async validateAndCalculate(
        memberId: any,
        memberCouponId: number,
        context: CouponMatchContext
    ): Promise<DiscountResult> {
        const mid = Number(memberId);
        // 确保 totalAmount 是 Decimal
        const totalAmount = new Decimal(context.totalAmount);
        const items = context.items.map((item) => ({
            ...item,
            price: new Decimal(item.price),
        }));

        const mc = await this.memberCouponRepository.findOne({
            where: {
                id: memberCouponId,
                memberId: mid,
                status: MemberCouponStatus.UNUSED,
                expireTime: MoreThan(new Date()),
            },
            relations: ['coupon'],
        });

        if (!mc) {
            throw new BadRequestException('优惠券不可用或已过期');
        }

        const coupon = mc.coupon;
        if (coupon.status !== CouponStatus.ACTIVE) {
            throw new BadRequestException('优惠券已失效');
        }

        // 适用范围校验
        let scopeAmount = new Decimal(0);
        if (coupon.scopeType === CouponScopeType.ALL) {
            scopeAmount = totalAmount;
        } else {
            const scopes = await this.couponScopeRepository.find({
                where: { couponId: Number(coupon.id) },
            });
            const targetIds = scopes.map((s) => Number(s.targetId));

            if (coupon.scopeType === CouponScopeType.CATEGORY) {
                const matchedItems = items.filter((item) =>
                    targetIds.includes(item.categoryId)
                );
                if (matchedItems.length === 0) {
                    throw new BadRequestException(
                        '优惠券不适用于订单中的商品分类'
                    );
                }
                scopeAmount = matchedItems.reduce(
                    (sum, item) => sum.plus(item.price.times(item.quantity)),
                    new Decimal(0)
                );
            } else if (coupon.scopeType === CouponScopeType.PRODUCT) {
                const matchedItems = items.filter((item) =>
                    targetIds.includes(item.productId)
                );
                if (matchedItems.length === 0) {
                    throw new BadRequestException('优惠券不适用于订单中的商品');
                }
                scopeAmount = matchedItems.reduce(
                    (sum, item) => sum.plus(item.price.times(item.quantity)),
                    new Decimal(0)
                );
            }
        }

        const strategy = CouponStrategyFactory.getStrategy(coupon.type);
        const tempContext = { ...context, totalAmount: scopeAmount, items };

        if (!strategy.canUse(coupon, tempContext)) {
            throw new BadRequestException('未达到优惠券使用门槛');
        }

        return strategy.calculate(coupon, tempContext);
    }

    /**
     * 使用优惠券 (更新状态)
     */
    async useCoupon(manager: any, memberCouponId: number, orderId: number) {
        return await manager.update(
            MallMemberCouponEntity,
            { id: memberCouponId },
            {
                status: MemberCouponStatus.USED,
                usedAt: new Date(),
                orderId,
            }
        );
    }
}
