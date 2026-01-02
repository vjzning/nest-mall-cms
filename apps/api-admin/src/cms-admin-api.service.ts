import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
    MallOrderEntity,
    OrderStatus,
    MallAfterSaleEntity,
    AfterSaleStatus,
} from '@app/db';
import { NotificationService } from '@app/notification';

@Injectable()
export class CmsAdminApiService {
    private readonly logger = new Logger(CmsAdminApiService.name);

    constructor(
        @InjectRepository(MallOrderEntity)
        private readonly orderRepo: Repository<MallOrderEntity>,
        @InjectRepository(MallAfterSaleEntity)
        private readonly afterSaleRepo: Repository<MallAfterSaleEntity>,
        private readonly notificationService: NotificationService
    ) {}

    getHello(): string {
        return 'Hello World!';
    }

    /**
     * 每小时检查一次超期未处理的订单和售后
     */
    @Cron(CronExpression.EVERY_HOUR)
    async checkTimeouts() {
        this.logger.log('Checking for timeouts...');

        // 1. 检查超过 24 小时未付款或未处理的订单
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);

        const pendingOrders = await this.orderRepo.find({
            where: {
                status: OrderStatus.PENDING_PAY,
                createdAt: LessThan(yesterday),
            },
        });

        for (const order of pendingOrders) {
            await this.notificationService.send({
                targetType: 'ADMIN',
                type: 'ORDER_TIMEOUT',
                title: '订单处理超时',
                content: `订单 [${order.orderNo}] 已超过 24 小时未处理，请及时关注。`,
                payload: { orderId: order.id, orderNo: order.orderNo },
                channels: ['WEB', 'EMAIL'],
            });
        }

        // 2. 检查超过 24 小时未处理的售后申请
        const pendingAfterSales = await this.afterSaleRepo.find({
            where: {
                status: AfterSaleStatus.APPLIED,
                createdAt: LessThan(yesterday),
            },
        });

        for (const afterSale of pendingAfterSales) {
            await this.notificationService.send({
                targetType: 'ADMIN',
                type: 'AFTERSALE_TIMEOUT',
                title: '售后处理超时',
                content: `售后申请 [${afterSale.afterSaleNo}] 已超过 24 小时未处理，请及时关注。`,
                payload: {
                    afterSaleId: afterSale.id,
                    afterSaleNo: afterSale.afterSaleNo,
                },
                channels: ['WEB', 'EMAIL'],
            });
        }
    }
}
