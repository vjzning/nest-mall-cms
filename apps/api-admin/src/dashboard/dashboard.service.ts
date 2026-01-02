import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import {
    MallOrderEntity,
    OrderStatus,
} from '@app/db/entities/mall-order.entity';
import { MemberEntity } from '@app/db/entities/member.entity';
import { MallProductEntity } from '@app/db/entities/mall-product.entity';
import { MallProductSkuEntity } from '@app/db/entities/mall-product-sku.entity';
import { startOfDay, subDays, endOfDay, format } from 'date-fns';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(MallOrderEntity)
        private readonly orderRepo: Repository<MallOrderEntity>,
        @InjectRepository(MemberEntity)
        private readonly memberRepo: Repository<MemberEntity>,
        @InjectRepository(MallProductEntity)
        private readonly productRepo: Repository<MallProductEntity>,
        @InjectRepository(MallProductSkuEntity)
        private readonly skuRepo: Repository<MallProductSkuEntity>
    ) {}

    async getOverview() {
        const now = new Date();
        const yesterday = subDays(now, 1);

        // Total Revenue (All paid orders)
        const paidStatuses = [
            OrderStatus.PENDING_DELIVERY,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
            OrderStatus.COMPLETED,
        ];

        const { totalRevenue } = await this.orderRepo
            .createQueryBuilder('order')
            .select('SUM(order.payAmount)', 'totalRevenue')
            .where('order.status IN (:...statuses)', { statuses: paidStatuses })
            .getRawOne();

        // Pending Orders
        const pendingOrders = await this.orderRepo.count({
            where: { status: OrderStatus.PENDING_DELIVERY },
        });

        // New Members (last 24h)
        const newMembers = await this.memberRepo.count({
            where: { createdAt: Between(yesterday, now) },
        });

        // Active Products
        const activeProducts = await this.productRepo.count({
            where: { status: 1 },
        });

        return {
            totalRevenue: Number(totalRevenue || 0),
            pendingOrders,
            newMembers,
            activeProducts,
        };
    }

    async getStatistics() {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(new Date(), i);
            return {
                start: startOfDay(date),
                end: endOfDay(date),
                label: format(date, 'MMM dd'),
            };
        }).reverse();

        const paidStatuses = [
            OrderStatus.PENDING_DELIVERY,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
            OrderStatus.COMPLETED,
        ];

        const salesData = await Promise.all(
            last7Days.map(async (day) => {
                const { revenue, count } = await this.orderRepo
                    .createQueryBuilder('order')
                    .select('SUM(order.payAmount)', 'revenue')
                    .addSelect('COUNT(order.id)', 'count')
                    .where('order.status IN (:...statuses)', {
                        statuses: paidStatuses,
                    })
                    .andWhere('order.createdAt BETWEEN :start AND :end', {
                        start: day.start,
                        end: day.end,
                    })
                    .getRawOne();

                return {
                    date: day.label,
                    revenue: Number(revenue || 0),
                    orders: Number(count || 0),
                };
            })
        );

        // Order Status Distribution
        const statusStats = await this.orderRepo
            .createQueryBuilder('order')
            .select('order.status', 'status')
            .addSelect('COUNT(order.id)', 'count')
            .groupBy('order.status')
            .getRawMany();

        const totalOrders = statusStats.reduce(
            (sum, item) => sum + Number(item.count),
            0
        );
        const statusData = statusStats.map((item) => ({
            name: item.status,
            value:
                totalOrders > 0
                    ? Math.round((Number(item.count) / totalOrders) * 100)
                    : 0,
            count: Number(item.count),
        }));

        return {
            salesData,
            statusData,
        };
    }

    async getAlerts() {
        const recentOrders = await this.orderRepo.find({
            relations: ['member'],
            order: { createdAt: 'DESC' },
            take: 5,
        });

        const lowStockItems = await this.skuRepo.find({
            where: { stock: LessThan(10) },
            relations: ['product'],
            order: { stock: 'ASC' },
            take: 5,
        });

        return {
            recentOrders: recentOrders.map((o) => ({
                id: o.orderNo,
                user: o.member?.nickname || 'Unknown',
                amount: `¥${o.payAmount}`,
                status: o.status,
                time: o.createdAt,
            })),
            lowStockItems: lowStockItems.map((s) => ({
                id: s.product?.id,
                name: s.product?.name || 'Unknown',
                sku: s.code,
                stock: s.stock,
            })),
        };
    }
}
