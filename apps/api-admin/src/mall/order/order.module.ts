import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MallOrderEntity } from '@app/db/entities/mall-order.entity';
import { MallOrderItemEntity } from '@app/db/entities/mall-order-item.entity';
import { MallDeliveryEntity } from '@app/db/entities/mall-delivery.entity';
import { MallPaymentEntity } from '@app/db/entities/mall-payment.entity';
import { MallAfterSaleEntity } from '@app/db/entities/mall-after-sale.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullModule } from '@nestjs/bullmq';
import { ORDER_QUEUE, LOG_QUEUE } from '@app/queue';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MallOrderEntity,
            MallOrderItemEntity,
            MallDeliveryEntity,
            MallPaymentEntity,
            MallAfterSaleEntity,
        ]),
        BullModule.registerQueue({
            name: ORDER_QUEUE,
        }, {
            name: LOG_QUEUE,
        }),
        BullBoardModule.forFeature({
            name: ORDER_QUEUE,
            adapter: BullMQAdapter,
        }),
    ],
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule {}
