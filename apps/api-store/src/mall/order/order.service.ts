import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import {
  MallOrderEntity,
  OrderStatus,
} from "@app/db/entities/mall-order.entity";
import { MallOrderItemEntity } from "@app/db/entities/mall-order-item.entity";
import { MallProductSkuEntity } from "@app/db/entities/mall-product-sku.entity";
import {
  MallPaymentEntity,
  PaymentStatus as MallPaymentStatus,
  PaymentMethod,
} from "@app/db/entities/mall-payment.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { customAlphabet } from "nanoid";
import { alphanumeric } from "nanoid-dictionary";

import { Decimal } from "decimal.js";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { ORDER_QUEUE, ORDER_TIMEOUT_JOB } from "@app/queue";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(MallOrderEntity)
    public readonly orderRepo: Repository<MallOrderEntity>,
    @InjectRepository(MallOrderItemEntity)
    private readonly orderItemRepo: Repository<MallOrderItemEntity>,
    @InjectRepository(MallPaymentEntity)
    private readonly paymentRepo: Repository<MallPaymentEntity>,
    @InjectQueue(ORDER_QUEUE)
    private readonly orderQueue: Queue,
    private readonly dataSource: DataSource
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
        const sku = await queryRunner.manager.findOne(MallProductSkuEntity, {
          where: { id: itemDto.skuId },
          lock: { mode: "pessimistic_write" },
          relations: ["product"],
        });

        if (!sku) {
          throw new BadRequestException(`SKU #${itemDto.skuId} not found`);
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

        const itemTotal = new Decimal(sku.price).times(itemDto.quantity);
        totalAmount = totalAmount.plus(itemTotal);
        orderItems.push(orderItem);
      }

      // 4. Create Order
      const order = new MallOrderEntity();
      order.orderNo = `ORD${Date.now()}${customAlphabet(alphanumeric, 6)().toUpperCase()}`;
      order.memberId = memberId;
      order.totalAmount = totalAmount.toNumber();
      order.payAmount = totalAmount.toNumber(); // No coupon logic yet
      order.status = OrderStatus.PENDING_PAY;
      order.receiverInfo = createOrderDto.receiverInfo;
      order.remark = createOrderDto.remark;

      const savedOrder = await queryRunner.manager.save(order);

      // 5. Save Items
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
    status?: OrderStatus,
    page: number = 1,
    limit: number = 10
  ) {
    const query = this.orderRepo
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.items", "items")
      .where("order.memberId = :memberId", { memberId })
      .orderBy("order.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      query.andWhere("order.status = :status", { status });
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
      relations: ["items"],
    });
  }

  async cancel(id: number, memberId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(MallOrderEntity, {
        where: { id, memberId },
        relations: ["items"],
        lock: { mode: "pessimistic_write" },
      });

      if (!order) {
        throw new BadRequestException("Order not found");
      }

      if (order.status !== OrderStatus.PENDING_PAY) {
        throw new BadRequestException(
          "Only pending payment orders can be cancelled"
        );
      }

      // 1. Restore Stock
      for (const item of order.items) {
        await queryRunner.manager.increment(
          MallProductSkuEntity,
          { id: item.skuId },
          "stock",
          item.quantity
        );
      }

      // 2. Update Status
      order.status = OrderStatus.CANCELLED;
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
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
    method: string = "wechat"
  ) {
    const order = await this.orderRepo.findOne({
      where: { orderNo },
      relations: ["items"],
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

    return order;
  }

  async confirmReceipt(id: number, memberId?: number) {
    const order = await this.orderRepo.findOne({
      where: memberId ? { id, memberId } : { id },
    });

    if (!order) {
      throw new BadRequestException("Order not found");
    }

    if (order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException("Only shipped orders can be confirmed");
    }

    order.status = OrderStatus.COMPLETED;
    // order.finishTime = new Date(); // Could add this field to entity later

    const savedOrder = await this.orderRepo.save(order);

    // Remove auto-confirm job if exists
    try {
      const job = await this.orderQueue.getJob(`auto-confirm-${order.id}`);
      if (job) {
        await job.remove();
      }
    } catch (err) {
      // Ignore
    }

    return savedOrder;
  }
}
