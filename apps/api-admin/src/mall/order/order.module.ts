import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MallOrderEntity } from '@app/db/entities/mall-order.entity';
import { MallOrderItemEntity } from '@app/db/entities/mall-order-item.entity';
import { MallDeliveryEntity } from '@app/db/entities/mall-delivery.entity';
import { MallPaymentEntity } from '@app/db/entities/mall-payment.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    MallOrderEntity,
    MallOrderItemEntity,
    MallDeliveryEntity,
    MallPaymentEntity
  ])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule { }
