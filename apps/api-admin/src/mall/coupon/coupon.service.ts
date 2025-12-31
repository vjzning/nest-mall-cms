import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
    MallCouponEntity,
    CouponStatus,
} from '@app/db/entities/mall-coupon.entity';
import { MallCouponScopeEntity } from '@app/db/entities/mall-coupon-scope.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
    constructor(
        @InjectRepository(MallCouponEntity)
        private readonly couponRepository: Repository<MallCouponEntity>,
        @InjectRepository(MallCouponScopeEntity)
        private readonly couponScopeRepository: Repository<MallCouponScopeEntity>,
        private readonly dataSource: DataSource
    ) {}

    /**
     * 创建优惠券
     */
    async create(createCouponDto: CreateCouponDto) {
        const { scopeTargetIds, ...couponData } = createCouponDto;

        return await this.dataSource.transaction(async (manager) => {
            // 1. 保存优惠券主体
            const coupon = manager.create(MallCouponEntity, {
                ...couponData,
                remainingQuantity: couponData.totalQuantity ?? -1,
            });
            const savedCoupon = await manager.save(coupon);

            // 2. 保存适用范围（如果有）
            if (scopeTargetIds && scopeTargetIds.length > 0) {
                const scopes = scopeTargetIds.map((targetId) =>
                    manager.create(MallCouponScopeEntity, {
                        couponId: savedCoupon.id,
                        targetId,
                    })
                );
                await manager.save(scopes);
            }

            return savedCoupon;
        });
    }

    /**
     * 获取优惠券列表
     */
    async findAll(query: any) {
        const { name, status, type, page = 1, limit = 10 } = query;
        const qb = this.couponRepository.createQueryBuilder('coupon');

        if (name) {
            qb.andWhere('coupon.name LIKE :name', { name: `%${name}%` });
        }
        if (status !== undefined) {
            qb.andWhere('coupon.status = :status', { status });
        }
        if (type !== undefined) {
            qb.andWhere('coupon.type = :type', { type });
        }

        qb.orderBy('coupon.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [items, total] = await qb.getManyAndCount();
        return {
            items,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * 获取优惠券详情
     */
    async findOne(id: number) {
        const coupon = await this.couponRepository.findOne({ where: { id } });
        if (!coupon) {
            throw new NotFoundException('优惠券不存在');
        }

        const scopes = await this.couponScopeRepository.find({
            where: { couponId: id },
        });
        return {
            ...coupon,
            scopeTargetIds: scopes.map((s) => s.targetId),
        };
    }

    /**
     * 更新优惠券
     */
    async update(id: number, updateCouponDto: UpdateCouponDto) {
        const { scopeTargetIds, ...couponData } = updateCouponDto;
        const coupon = await this.findOne(id);

        return await this.dataSource.transaction(async (manager) => {
            // 1. 更新优惠券主体
            await manager.update(MallCouponEntity, id, couponData);

            // 2. 更新适用范围（如果有提供）
            if (scopeTargetIds !== undefined) {
                // 先删除旧的
                await manager.delete(MallCouponScopeEntity, { couponId: id });
                // 再插入新的
                if (scopeTargetIds.length > 0) {
                    const scopes = scopeTargetIds.map((targetId) =>
                        manager.create(MallCouponScopeEntity, {
                            couponId: id,
                            targetId,
                        })
                    );
                    await manager.save(scopes);
                }
            }

            return await this.findOne(id);
        });
    }

    /**
     * 删除优惠券
     */
    async remove(id: number) {
        const coupon = await this.findOne(id);

        return await this.dataSource.transaction(async (manager) => {
            // 删除关联的适用范围
            await manager.delete(MallCouponScopeEntity, { couponId: id });
            // 删除优惠券主体
            await manager.delete(MallCouponEntity, id);
            return true;
        });
    }
}
