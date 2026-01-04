import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
    MallAfterSaleEntity,
    AfterSaleStatus,
    AfterSaleType,
} from '@app/db/entities/mall-after-sale.entity';
import { MallAfterSaleItemEntity } from '@app/db/entities/mall-after-sale-item.entity';
import {
    MallAfterSaleLogisticsEntity,
    AfterSaleLogisticsType,
} from '@app/db/entities/mall-after-sale-logistics.entity';
import {
    MallOrderEntity,
    OrderStatus,
} from '@app/db/entities/mall-order.entity';
import { MallOrderItemEntity } from '@app/db/entities/mall-order-item.entity';
import { ApplyAfterSaleDto, SubmitLogisticsDto } from './dto/after-sale.dto';
import { NotificationService } from '@app/notification';

@Injectable()
export class AfterSaleService {
    constructor(
        @InjectRepository(MallAfterSaleEntity)
        private readonly afterSaleRepo: Repository<MallAfterSaleEntity>,
        @InjectRepository(MallAfterSaleItemEntity)
        private readonly afterSaleItemRepo: Repository<MallAfterSaleItemEntity>,
        @InjectRepository(MallAfterSaleLogisticsEntity)
        private readonly logisticsRepo: Repository<MallAfterSaleLogisticsEntity>,
        @InjectRepository(MallOrderEntity)
        private readonly orderRepo: Repository<MallOrderEntity>,
        @InjectRepository(MallOrderItemEntity)
        private readonly orderItemRepo: Repository<MallOrderItemEntity>,
        private readonly notificationService: NotificationService
    ) {}

    async getRefundableInfo(orderId: number, memberId: number) {
        const order = await this.orderRepo.findOne({
            where: { id: orderId, memberId },
            relations: ['items'],
        });

        if (!order) {
            throw new NotFoundException('订单不存在');
        }

        // 只有已支付或已完成的订单可以申请售后
        const allowStatus = [
            OrderStatus.PENDING_DELIVERY,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
            OrderStatus.COMPLETED,
        ];
        if (!allowStatus.includes(order.status)) {
            throw new BadRequestException('当前订单状态不允许申请售后');
        }

        // 排除已经申请过售后的项 (处理中或已完成)
        const existingAfterSales = await this.afterSaleRepo.find({
            where: {
                orderId: order.id,
                status: In([
                    AfterSaleStatus.APPLIED,
                    AfterSaleStatus.APPROVED,
                    AfterSaleStatus.WAITING_RECEIPT,
                    AfterSaleStatus.PROCESSING,
                    AfterSaleStatus.REFUNDED,
                    AfterSaleStatus.COMPLETED,
                ]),
            },
            relations: ['items'],
        });

        const appliedOrderItemIds = new Set();
        existingAfterSales.forEach((as) => {
            as.items.forEach((item) => {
                appliedOrderItemIds.add(Number(item.orderItemId));
            });
        });

        const items = order.items
            .filter((item) => !appliedOrderItemIds.has(Number(item.id)))
            .map((item) => ({
                orderItemId: item.id,
                skuId: item.skuId,
                productName: item.productName,
                price: item.price,
                maxQuantity: item.quantity,
                shippedQuantity: item.shippedQuantity,
            }));

        return {
            orderId: order.id,
            orderNo: order.orderNo,
            payAmount: order.payAmount,
            items,
        };
    }

    async apply(dto: ApplyAfterSaleDto, memberId: number) {
        const order = await this.orderRepo.findOne({
            where: { id: dto.orderId, memberId },
            relations: ['items'],
        });

        if (!order) {
            throw new NotFoundException('订单不存在');
        }

        // 校验是否已经存在进行中的售后
        const existingAfterSale = await this.afterSaleRepo.findOne({
            where: {
                orderId: dto.orderId,
                status: In([
                    AfterSaleStatus.APPLIED,
                    AfterSaleStatus.APPROVED,
                    AfterSaleStatus.WAITING_RECEIPT,
                    AfterSaleStatus.PROCESSING,
                ]),
            },
        });

        if (existingAfterSale) {
            throw new BadRequestException('该订单已有进行中的售后申请');
        }

        // 校验申请的订单项是否已经申请过售后 (针对已完成/已退款的售后)
        const appliedItems = await this.afterSaleItemRepo
            .createQueryBuilder('asi')
            .leftJoin('asi.afterSale', 'as')
            .where('as.orderId = :orderId', { orderId: dto.orderId })
            .andWhere('as.status NOT IN (:...statuses)', {
                statuses: [AfterSaleStatus.CANCELLED, AfterSaleStatus.REJECTED],
            })
            .getMany();

        const appliedOrderItemIds = appliedItems.map((i) =>
            Number(i.orderItemId)
        );
        for (const itemDto of dto.items) {
            if (appliedOrderItemIds.includes(itemDto.orderItemId)) {
                throw new BadRequestException(
                    '部分商品已申请过售后，请勿重复操作'
                );
            }
        }

        // 基础校验
        const orderItemIds = dto.items.map((i) => i.orderItemId);
        const orderItems = order.items.filter((item) =>
            orderItemIds.includes(Number(item.id))
        );

        if (orderItems.length !== dto.items.length) {
            throw new BadRequestException('部分订单项不存在');
        }

        // 计算退款金额 (示例逻辑：按比例计算)
        let applyAmount = 0;
        for (const itemDto of dto.items) {
            const orderItem = orderItems.find(
                (oi) => Number(oi.id) === itemDto.orderItemId
            );
            if (!orderItem) {
                throw new BadRequestException(
                    `订单项 ${itemDto.orderItemId} 不存在`
                );
            }
            if (itemDto.quantity > orderItem.quantity) {
                throw new BadRequestException(
                    `商品 ${orderItem.productName} 售后数量超出限制`
                );
            }
            applyAmount += Number(orderItem.price) * itemDto.quantity;
        }

        // 简单校验：退款金额不能超过支付金额
        if (applyAmount > order.payAmount) {
            applyAmount = order.payAmount;
        }

        // 创建售后单
        const afterSale = this.afterSaleRepo.create({
            afterSaleNo: `AS${Date.now()}${Math.floor(Math.random() * 1000)}`,
            orderId: order.id,
            orderNo: order.orderNo,
            memberId,
            type: dto.type,
            status: AfterSaleStatus.APPLIED,
            applyReason: dto.applyReason,
            description: dto.description,
            images: dto.images,
            applyAmount,
        });

        const savedAfterSale = await this.afterSaleRepo.save(afterSale);

        // 创建售后商品项
        const afterSaleItems = dto.items.map((itemDto) => {
            const orderItem = orderItems.find(
                (oi) => Number(oi.id) === itemDto.orderItemId
            );
            if (!orderItem) {
                throw new BadRequestException(
                    `订单项 ${itemDto.orderItemId} 不存在`
                );
            }
            return this.afterSaleItemRepo.create({
                afterSaleId: savedAfterSale.id,
                orderItemId: orderItem.id,
                skuId: orderItem.skuId,
                quantity: itemDto.quantity,
                price: orderItem.price,
            });
        });

        await this.afterSaleItemRepo.save(afterSaleItems);

        // 发送通知给管理员
        try {
            await this.notificationService.send({
                targetType: 'ADMIN',
                type: 'NEW_AFTERSALE',
                title: '新售后申请通知',
                content: `订单 [${order.orderNo}] 有新的售后申请 [${savedAfterSale.afterSaleNo}]，请及时处理。`,
                payload: {
                    afterSaleId: savedAfterSale.id,
                    afterSaleNo: savedAfterSale.afterSaleNo,
                    path: `/mall/after-sale/${savedAfterSale.id}`,
                },
            });
        } catch (err) {
            // 忽略通知错误
        }

        return savedAfterSale;
    }

    async list(
        memberId: number,
        status?: AfterSaleStatus,
        page: number = 1,
        limit: number = 10
    ) {
        const [items, total] = await this.afterSaleRepo.findAndCount({
            where: { memberId, ...(status && { status }) },
            order: { createdAt: 'DESC' },
            relations: ['items', 'items.orderItem'],
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            items,
            total,
            page,
            limit,
        };
    }

    async detail(id: number, memberId: number) {
        const afterSale = await this.afterSaleRepo.findOne({
            where: { id, memberId },
            relations: ['items', 'items.orderItem', 'order', 'logistics'],
        });

        if (!afterSale) {
            throw new NotFoundException('售后单不存在');
        }

        return afterSale;
    }

    async cancel(id: number, memberId: number) {
        const afterSale = await this.afterSaleRepo.findOne({
            where: { id, memberId },
        });

        if (!afterSale) {
            throw new NotFoundException('售后单不存在');
        }

        if (afterSale.status !== AfterSaleStatus.APPLIED) {
            throw new BadRequestException('当前状态不可取消');
        }

        afterSale.status = AfterSaleStatus.CANCELLED;
        return this.afterSaleRepo.save(afterSale);
    }

    async submitLogistics(
        id: number,
        dto: SubmitLogisticsDto,
        memberId: number
    ) {
        const afterSale = await this.afterSaleRepo.findOne({
            where: { id, memberId },
        });

        if (!afterSale) {
            throw new NotFoundException('售后单不存在');
        }

        if (afterSale.status !== AfterSaleStatus.APPROVED) {
            throw new BadRequestException('请等待审核通过后再填写物流');
        }

        const logistics = this.logisticsRepo.create({
            afterSaleId: afterSale.id,
            type: AfterSaleLogisticsType.USER_RETURN,
            trackingNo: dto.trackingNo,
            carrier: dto.carrier,
        });

        await this.logisticsRepo.save(logistics);

        afterSale.status = AfterSaleStatus.WAITING_RECEIPT;
        return this.afterSaleRepo.save(afterSale);
    }
}
