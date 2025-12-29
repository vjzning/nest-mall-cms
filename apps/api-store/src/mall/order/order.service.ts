import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import {
  MallOrderEntity,
  OrderStatus,
} from "@app/db/entities/mall-order.entity";
import { MallOrderItemEntity } from "@app/db/entities/mall-order-item.entity";
import { MallProductSkuEntity } from "@app/db/entities/mall-product-sku.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { nanoid } from "nanoid";
import { Decimal } from "decimal.js";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(MallOrderEntity)
    private readonly orderRepo: Repository<MallOrderEntity>,
    @InjectRepository(MallOrderItemEntity)
    private readonly orderItemRepo: Repository<MallOrderItemEntity>,
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
      order.orderNo = `ORD${Date.now()}${nanoid(6).toUpperCase()}`;
      order.memberId = memberId;
      order.totalAmount = totalAmount.toNumber();
      order.payAmount = totalAmount.toNumber(); // No coupon logic yet
      order.status = OrderStatus.PENDING_PAY;
      order.receiverInfo = createOrderDto.receiverInfo;

      const savedOrder = await queryRunner.manager.save(order);

      // 5. Save Items
      for (const item of orderItems) {
        item.orderId = savedOrder.id;
      }
      await queryRunner.manager.save(MallOrderItemEntity, orderItems);

      await queryRunner.commitTransaction();
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

  async confirmReceipt(id: number, memberId: number) {
    const order = await this.findOne(id, memberId);
    if (!order) {
      throw new BadRequestException("Order not found");
    }
    if (
      order.status !== OrderStatus.SHIPPED &&
      order.status !== OrderStatus.DELIVERED
    ) {
      throw new BadRequestException("Order cannot be confirmed yet");
    }
    order.status = OrderStatus.COMPLETED;
    return this.orderRepo.save(order);
  }
}
