import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, type FindOptionsWhere } from 'typeorm';
import { MallOrderEntity, OrderStatus } from '@app/db/entities/mall-order.entity';
import { MallOrderItemEntity } from '@app/db/entities/mall-order-item.entity';
import { MallDeliveryEntity } from '@app/db/entities/mall-delivery.entity';
import { MallPaymentEntity, PaymentStatus } from '@app/db/entities/mall-payment.entity';
import { OrderDeliveryDto } from './dto/order-delivery.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { Like } from 'typeorm';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(MallOrderEntity)
    private readonly orderRepo: Repository<MallOrderEntity>,
    @InjectRepository(MallOrderItemEntity)
    private readonly orderItemRepo: Repository<MallOrderItemEntity>,
    @InjectRepository(MallDeliveryEntity)
    private readonly deliveryRepo: Repository<MallDeliveryEntity>,
    @InjectRepository(MallPaymentEntity)
    private readonly paymentRepo: Repository<MallPaymentEntity>,
    private readonly dataSource: DataSource,
  ) { }



  async findAll(query: QueryOrderDto) {
    const { page = 1, pageSize = 10, orderNo, status, memberId } = query;

    const where: FindOptionsWhere<MallOrderEntity> = {};
    if (orderNo) where.orderNo = Like(`%${orderNo}%`);
    if (status) where.status = status;
    if (memberId) where.memberId = memberId;

    const [items, total] = await this.orderRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      relations: ['member'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'member', 'deliveries'],
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    // Attach payment info
    const payment = await this.paymentRepo.findOne({
      where: {
        orderNo: order.orderNo,
        status: PaymentStatus.SUCCESS
      }
    });

    return {
      ...order,
      payment: payment || null,
    };
  }

  async ship(id: number, deliveryDto: OrderDeliveryDto) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Fetch Order with items (using manager for transactional consistency)
      const order = await manager.findOne(MallOrderEntity, {
        where: { id },
        relations: ['items'],
      });

      if (!order) throw new NotFoundException('Order not found');

      if (![OrderStatus.PENDING_DELIVERY, OrderStatus.PARTIALLY_SHIPPED].includes(order.status)) {
        throw new BadRequestException(`Order status ${order.status} allows shipping`);
      }

      // 2. Validate Items to Ship
      const itemsToShip: { skuId: number; quantity: number; productName: string }[] = [];

      for (const shipItem of deliveryDto.items) {
        const orderItem = order.items.find(i => Number(i.skuId) === Number(shipItem.skuId));
        if (!orderItem) {
          throw new BadRequestException(`SKU ${shipItem.skuId} not found in this order`);
        }

        const remainingQty = orderItem.quantity - orderItem.shippedQuantity;
        if (shipItem.quantity > remainingQty) {
          throw new BadRequestException(
            `Shipped quantity (${shipItem.quantity}) exceeds remaining quantity (${remainingQty}) for Product ${orderItem.productName}`
          );
        }

        // Update shipped quantity
        orderItem.shippedQuantity += shipItem.quantity;
        await manager.save(orderItem);

        itemsToShip.push({
          skuId: orderItem.skuId,
          quantity: shipItem.quantity,
          productName: orderItem.productName,
        });
      }

      // 3. Create Delivery Record
      const delivery = manager.create(MallDeliveryEntity, {
        orderId: order.id,
        deliverySn: deliveryDto.trackingNo,
        deliveryCompany: deliveryDto.carrier,
        items: itemsToShip,
        remark: deliveryDto.remark,
      });
      await manager.save(delivery);

      // 4. Update Order Status
      // Check if all items are fully shipped
      const allShipped = order.items.every(item => item.quantity === item.shippedQuantity);

      if (allShipped) {
        order.status = OrderStatus.SHIPPED;
      } else {
        order.status = OrderStatus.PARTIALLY_SHIPPED;
      }

      return await manager.save(order);
    });
  }
}
