import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MallOrderEntity, OrderStatus } from '@app/db/entities/mall-order.entity';
import { MallOrderItemEntity } from '@app/db/entities/mall-order-item.entity';
import { MallProductSkuEntity } from '@app/db/entities/mall-product-sku.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(MallOrderEntity)
    private readonly orderRepo: Repository<MallOrderEntity>,
    @InjectRepository(MallOrderItemEntity)
    private readonly orderItemRepo: Repository<MallOrderItemEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, memberId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const orderItems: MallOrderItemEntity[] = [];

      for (const itemDto of createOrderDto.items) {
        // 1. Check SKU and Stock (with PESSIMISTIC_WRITE lock if needed, but here using update check)
        // Using pessimistic lock to prevent race conditions properly
        const sku = await queryRunner.manager.findOne(MallProductSkuEntity, {
          where: { id: itemDto.skuId },
          lock: { mode: 'pessimistic_write' },
          relations: ['product'],
        });

        if (!sku) {
          throw new BadRequestException(`SKU #${itemDto.skuId} not found`);
        }

        if (sku.stock < itemDto.quantity) {
          throw new BadRequestException(`Insufficient stock for SKU: ${sku.code}`);
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
        
        totalAmount += Number(sku.price) * itemDto.quantity;
        orderItems.push(orderItem);
      }

      // 4. Create Order
      const order = new MallOrderEntity();
      order.orderNo = `ORD${Date.now()}${nanoid(6).toUpperCase()}`;
      order.memberId = memberId;
      order.totalAmount = totalAmount;
      order.payAmount = totalAmount; // No coupon logic yet
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

  async findMyOrders(memberId: number) {
    return this.orderRepo.find({
      where: { memberId },
      order: { createdAt: 'DESC' },
      relations: ['items'],
    });
  }
}
