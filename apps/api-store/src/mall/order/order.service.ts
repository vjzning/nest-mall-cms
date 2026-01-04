import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import {
    MallOrderEntity,
    OrderStatus,
} from '@app/db/entities/mall-order.entity';
import { MallOrderItemEntity } from '@app/db/entities/mall-order-item.entity';
import { MallProductSkuEntity } from '@app/db/entities/mall-product-sku.entity';
import {
    MallPaymentEntity,
    PaymentStatus as MallPaymentStatus,
    PaymentMethod,
} from '@app/db/entities/mall-payment.entity';
import { MemberAddressEntity } from '@app/db/entities/member-address.entity';
import { FlashSaleProductEntity } from '@app/db/entities/flash-sale-product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { customAlphabet } from 'nanoid';
import { alphanumeric } from 'nanoid-dictionary';

import { Decimal } from 'decimal.js';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ORDER_QUEUE, ORDER_TIMEOUT_JOB } from '@app/queue';
import { ShippingService } from '../shipping/shipping.service';
import { CouponService } from '../coupon/coupon.service';
import { MallProductEntity } from '@app/db/entities/mall-product.entity';
import { NotificationService } from '@app/notification';
import { RedisClientService } from '@app/redis';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(MallOrderEntity)
        public readonly orderRepo: Repository<MallOrderEntity>,
        @InjectRepository(MallOrderItemEntity)
        private readonly orderItemRepo: Repository<MallOrderItemEntity>,
        @InjectRepository(MallPaymentEntity)
        private readonly paymentRepo: Repository<MallPaymentEntity>,
        @InjectRepository(MemberAddressEntity)
        private readonly addressRepo: Repository<MemberAddressEntity>,
        @InjectQueue(ORDER_QUEUE)
        private readonly orderQueue: Queue,
        private readonly dataSource: DataSource,
        private readonly shippingService: ShippingService,
        private readonly couponService: CouponService,
        private readonly notificationService: NotificationService,
        private readonly redis: RedisClientService
    ) {}

    async create(createOrderDto: CreateOrderDto, memberId: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let totalAmount = new Decimal(0);
            const orderItems: MallOrderItemEntity[] = [];

            // 0. Sort items by SKU ID to prevent deadlocks
            const sortedItems = [...createOrderDto.items].sort(
                (a, b) => a.skuId - b.skuId
            );

            for (const itemDto of sortedItems) {
                // 1. Check SKU and Stock (with PESSIMISTIC_WRITE lock)
                // Using pessimistic lock to prevent race conditions properly
                const sku = await queryRunner.manager.findOne(
                    MallProductSkuEntity,
                    {
                        where: { id: itemDto.skuId },
                        lock: { mode: 'pessimistic_write' },
                        relations: ['product'],
                    }
                );

                if (!sku) {
                    throw new BadRequestException(
                        `SKU #${itemDto.skuId} not found`
                    );
                }

                if (sku.stock < itemDto.quantity) {
                    throw new BadRequestException(
                        `Insufficient stock for SKU: ${sku.code}`
                    );
                }

                // 2. Deduct Stock
                sku.stock -= itemDto.quantity;
                await queryRunner.manager.save(sku);

                // 3. Prepare Order Item
                const orderItem = new MallOrderItemEntity();
                orderItem.productId = sku.productId;
                orderItem.skuId = sku.id;
                orderItem.productName = sku.product.name;
                orderItem.productImg = sku.product.cover; // Simplified
                orderItem.skuSpecs = sku.specs;
                orderItem.price = sku.price;
                orderItem.quantity = itemDto.quantity;

                const itemTotal = new Decimal(sku.price).times(
                    itemDto.quantity
                );
                totalAmount = totalAmount.plus(itemTotal);
                orderItems.push(orderItem);
            }

            // 4. Calculate Shipping Fee
            const shippingItems = orderItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: Number(item.price),
            }));
            let shippingFee = await this.shippingService.calculateShippingFee(
                shippingItems,
                createOrderDto.receiverInfo.provinceId
            );

            // 5. Apply Coupon
            let discountAmount = new Decimal(0);
            if (createOrderDto.memberCouponId) {
                // Prepare context for coupon matching
                const products = await queryRunner.manager.find(
                    MallProductEntity,
                    {
                        where: { id: In(orderItems.map((i) => i.productId)) },
                    }
                );
                const productMap = new Map(
                    products.map((p) => [Number(p.id), p])
                );

                const couponContext = {
                    memberId,
                    items: orderItems.map((item) => ({
                        productId: item.productId,
                        categoryId:
                            productMap.get(item.productId)?.categoryId || 0,
                        price: new Decimal(item.price),
                        quantity: item.quantity,
                    })),
                    totalAmount: totalAmount,
                };

                const result = await this.couponService.validateAndCalculate(
                    memberId,
                    createOrderDto.memberCouponId,
                    couponContext
                );

                discountAmount = result.discountAmount;
                if (result.isFreeShipping) {
                    shippingFee = 0;
                }
            }

            // 6. Create Order
            const order = new MallOrderEntity();
            order.orderNo = `ORD${Date.now()}${customAlphabet(alphanumeric, 6)().toUpperCase()}`;
            order.memberId = memberId;
            order.totalAmount = totalAmount.toNumber();
            order.shippingFee = shippingFee;
            order.payAmount = Decimal.max(
                0,
                totalAmount.plus(shippingFee).minus(discountAmount)
            ).toNumber();
            order.status = OrderStatus.PENDING_PAY;
            order.receiverInfo = createOrderDto.receiverInfo;
            order.remark = createOrderDto.remark;

            const savedOrder = await queryRunner.manager.save(order);

            // 7. Update Coupon Status
            if (createOrderDto.memberCouponId) {
                await this.couponService.useCoupon(
                    queryRunner.manager,
                    createOrderDto.memberCouponId,
                    savedOrder.id
                );
            }

            // 8. Save Items
            for (const item of orderItems) {
                item.orderId = savedOrder.id;
            }
            await queryRunner.manager.save(MallOrderItemEntity, orderItems);

            await queryRunner.commitTransaction();

            // 6. Add timeout job (30 minutes)
            await this.orderQueue.add(
                ORDER_TIMEOUT_JOB,
                { orderId: savedOrder.id },
                {
                    delay: 30 * 60 * 1000,
                    jobId: `timeout-${savedOrder.id}`,
                }
            );

            return savedOrder;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async findMyOrders(
        memberId: number,
        status?: string,
        page: number = 1,
        limit: number = 10
    ) {
        const query = this.orderRepo
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .where('order.memberId = :memberId', { memberId })
            .orderBy('order.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (status && status !== 'ALL') {
            if (status === 'WAITING_RECEIVE') {
                query.andWhere('order.status IN (:...statuses)', {
                    statuses: [OrderStatus.SHIPPED, OrderStatus.DELIVERED],
                });
            } else {
                query.andWhere('order.status = :status', { status });
            }
        }

        const [items, total] = await query.getManyAndCount();

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number, memberId: number) {
        return this.orderRepo.findOne({
            where: { id, memberId },
            relations: ['items'],
        });
    }

    async cancel(id: number, memberId: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const order = await queryRunner.manager.findOne(MallOrderEntity, {
                where: { id, memberId },
                relations: ['items'],
                lock: { mode: 'pessimistic_write' },
            });

            if (!order) {
                throw new BadRequestException('Order not found');
            }

            if (order.status !== OrderStatus.PENDING_PAY) {
                throw new BadRequestException(
                    'Only pending payment orders can be cancelled'
                );
            }

            // 1. Restore Stock
            for (const item of order.items) {
                await queryRunner.manager.increment(
                    MallProductSkuEntity,
                    { id: item.skuId },
                    'stock',
                    item.quantity
                );

                // 如果是秒杀订单，额外恢复秒杀库存和销量
                if (order.activityId) {
                    await queryRunner.manager.increment(
                        FlashSaleProductEntity,
                        { activityId: order.activityId, skuId: item.skuId },
                        'stock',
                        item.quantity
                    );
                    await queryRunner.manager.decrement(
                        FlashSaleProductEntity,
                        { activityId: order.activityId, skuId: item.skuId },
                        'sales',
                        item.quantity
                    );
                }
            }

            // 2. Update Status
            order.status = OrderStatus.CANCELLED;
            await queryRunner.manager.save(order);

            await queryRunner.commitTransaction();

            // 3. 异步恢复 Redis 中的秒杀库存和限购
            if (order.activityId) {
                try {
                    const client = await this.redis.getClient();
                    for (const item of order.items) {
                        const stockKey = `flash_sale:stock:${item.skuId}`;
                        const userLimitKey = `flash_sale:user_limit:${order.activityId}:${item.skuId}`;

                        // 增加 Redis 库存
                        await client.incrBy(stockKey, item.quantity);
                        // 减少用户已购数量
                        await client.hIncrBy(
                            userLimitKey,
                            String(memberId),
                            -item.quantity
                        );
                    }
                } catch (redisError) {
                    console.error(
                        'Failed to restore flash sale limits in Redis:',
                        redisError
                    );
                }
            }

            return order;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async handlePaid(
        orderNo: string,
        transactionId: string,
        payAmount: number,
        method: string = 'wechat'
    ) {
        const order = await this.orderRepo.findOne({
            where: { orderNo },
            relations: ['items'],
        });

        if (!order) {
            throw new Error(`Order ${orderNo} not found`);
        }

        if (order.status !== OrderStatus.PENDING_PAY) {
            return order; // Already processed
        }

        // Verify amount
        if (Math.abs(order.payAmount - payAmount) > 0.01) {
            throw new Error(`Payment amount mismatch for order ${orderNo}`);
        }

        // Use transaction to ensure both order and payment record are updated
        await this.dataSource.transaction(async (manager) => {
            // 1. Update Order
            order.status = OrderStatus.PENDING_DELIVERY;
            order.paidAt = new Date();
            order.transactionId = transactionId;
            await manager.save(order);

            // 2. Create/Update Payment Record
            let payment = await manager.findOne(MallPaymentEntity, {
                where: { orderNo, status: MallPaymentStatus.PENDING },
            });

            if (!payment) {
                payment = new MallPaymentEntity();
                payment.orderNo = orderNo;
            }

            payment.transactionId = transactionId;
            payment.paymentMethod = method as PaymentMethod;
            payment.amount = payAmount;
            payment.status = MallPaymentStatus.SUCCESS;
            payment.paidAt = new Date();
            await manager.save(payment);
        });

        // 3. Remove timeout job
        try {
            const job = await this.orderQueue.getJob(`timeout-${order.id}`);
            if (job) {
                await job.remove();
            }
        } catch (err) {
            // Ignore error
        }

        // 4. Send notification to ADMIN
        try {
            await this.notificationService.send({
                targetType: 'ADMIN',
                type: 'NEW_ORDER',
                title: '新订单通知',
                content: `您有一个新的待发货订单 [${order.orderNo}]，请及时处理。`,
                payload: {
                    orderId: order.id,
                    orderNo: order.orderNo,
                    path: `/mall/order/${order.id}`,
                },
            });
        } catch (err) {
            // Ignore notification error to avoid blocking payment success
        }

        return order;
    }

    /**
     * 创建秒杀订单
     */
    async createFlashSaleOrder(
        manager: any,
        data: {
            memberId: number;
            flashProduct: FlashSaleProductEntity;
            sku: MallProductSkuEntity;
            addressId: number;
        }
    ) {
        const { memberId, flashProduct, sku, addressId } = data;

        // 1. 获取收货信息
        const address = await this.addressRepo.findOne({
            where: { id: addressId, memberId },
        });
        if (!address) {
            throw new Error('收货地址不存在');
        }

        const receiverInfo = {
            name: address.receiverName,
            phone: address.receiverPhone,
            address: `${address.stateProvince} ${address.city} ${address.districtCounty} ${address.addressLine1} ${address.addressLine2 || ''}`,
            provinceId: null, // 秒杀订单暂不计算复杂运费，可根据需要扩展
        };

        // 2. 创建订单
        const order = new MallOrderEntity();
        order.orderNo = `FS${Date.now()}${customAlphabet(alphanumeric, 6)().toUpperCase()}`;
        order.memberId = memberId;
        order.activityId = flashProduct.activityId;
        order.status = OrderStatus.PENDING_PAY;
        order.totalAmount = flashProduct.flashPrice;
        order.payAmount = flashProduct.flashPrice;
        order.shippingFee = 0; // 秒杀通常包邮，或使用固定运费
        order.receiverInfo = receiverInfo;

        const savedOrder = await manager.save(MallOrderEntity, order);

        // 3. 创建订单详情
        const orderItem = new MallOrderItemEntity();
        orderItem.orderId = savedOrder.id;
        orderItem.productId = sku.productId;
        orderItem.skuId = sku.id;
        orderItem.productName = sku.product.name;
        orderItem.productImg = sku.product.cover;
        orderItem.skuSpecs = sku.specs;
        orderItem.price = flashProduct.flashPrice;
        orderItem.quantity = 1;
        await manager.save(MallOrderItemEntity, orderItem);

        // 4. 添加超时取消任务 (秒杀通常 15 分钟不支付自动取消)
        await this.orderQueue.add(
            ORDER_TIMEOUT_JOB,
            { orderId: savedOrder.id },
            {
                delay: 15 * 60 * 1000,
                jobId: `timeout-${savedOrder.id}`,
            }
        );

        return savedOrder;
    }

    async confirmReceipt(id: number, memberId?: number) {
        const order = await this.orderRepo.findOne({
            where: memberId ? { id, memberId } : { id },
        });

        if (!order) {
            throw new BadRequestException('Order not found');
        }

        if (order.status !== OrderStatus.SHIPPED) {
            throw new BadRequestException(
                'Only shipped orders can be confirmed'
            );
        }

        order.status = OrderStatus.COMPLETED;
        // order.finishTime = new Date(); // Could add this field to entity later

        const savedOrder = await this.orderRepo.save(order);

        // Remove auto-confirm job if exists
        try {
            const job = await this.orderQueue.getJob(
                `auto-confirm-${order.id}`
            );
            if (job) {
                await job.remove();
            }
        } catch (err) {
            // Ignore
        }

        return savedOrder;
    }

    /**
     * 计算订单预览金额（包括运费）
     */
    async calculate(dto: CreateOrderDto, memberId: number) {
        let totalAmount = new Decimal(0);
        const shippingItems: any[] = [];
        const itemsForCoupon: any[] = [];

        for (const itemDto of dto.items) {
            const sku = await this.dataSource.manager.findOne(
                MallProductSkuEntity,
                {
                    where: { id: itemDto.skuId },
                    relations: ['product'],
                }
            );

            if (!sku) {
                throw new BadRequestException(
                    `SKU #${itemDto.skuId} not found`
                );
            }

            const itemTotal = new Decimal(sku.price).times(itemDto.quantity);
            totalAmount = totalAmount.plus(itemTotal);

            shippingItems.push({
                productId: sku.productId,
                quantity: itemDto.quantity,
                price: Number(sku.price),
            });

            itemsForCoupon.push({
                productId: sku.productId,
                categoryId: sku.product.categoryId || 0,
                price: new Decimal(sku.price),
                quantity: itemDto.quantity,
            });
        }

        let shippingFee = await this.shippingService.calculateShippingFee(
            shippingItems,
            dto.receiverInfo.provinceId
        );

        let discountAmount = new Decimal(0);
        if (dto.memberCouponId) {
            const couponContext = {
                memberId,
                items: itemsForCoupon,
                totalAmount,
            };

            const result = await this.couponService.validateAndCalculate(
                memberId,
                dto.memberCouponId,
                couponContext
            );

            discountAmount = result.discountAmount;
            if (result.isFreeShipping) {
                shippingFee = 0;
            }
        }

        return {
            totalAmount: totalAmount.toNumber(),
            shippingFee,
            discountAmount: discountAmount.toNumber(),
            payAmount: Decimal.max(
                0,
                totalAmount.plus(shippingFee).minus(discountAmount)
            ).toNumber(),
        };
    }
}
