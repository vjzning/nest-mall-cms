import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MallOrderEntity, OrderStatus } from '@app/db/entities/mall-order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(MallOrderEntity)
    private readonly orderRepo: Repository<MallOrderEntity>,
  ) {}

  findAll() {
    return this.orderRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['member'], // Include member info
    });
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'member'],
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  async ship(id: number, trackingInfo: { trackingNo: string; carrier: string }) {
    const order = await this.findOne(id);
    
    if (order.status !== OrderStatus.PENDING_DELIVERY) {
      throw new BadRequestException('Order status is not pending delivery');
    }

    // In a real app, we would save tracking info to a separate table or a column in order table
    // For now, let's assume we just update status.
    // Ideally, add tracking_no to MallOrderEntity
    
    order.status = OrderStatus.DELIVERED;
    // order.trackingNo = trackingInfo.trackingNo; 
    
    return this.orderRepo.save(order);
  }
}
