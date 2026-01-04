import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { MallOrderEntity } from '@app/db/entities/mall-order.entity';
import { MallOrderItemEntity } from '@app/db/entities/mall-order-item.entity';
import { MallProductSkuEntity } from '@app/db/entities/mall-product-sku.entity';
import { MallPaymentEntity } from '@app/db/entities/mall-payment.entity';
import { MemberAddressEntity } from '@app/db/entities/member-address.entity';
import { FlashSaleProductEntity } from '@app/db/entities/flash-sale-product.entity';
import { MallProductEntity } from '@app/db/entities/mall-product.entity';
import { ORDER_QUEUE, LOG_QUEUE } from '@app/queue';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderProcessor } from './queue/order.processor';
import { ShippingModule } from '../shipping/shipping.module';
import { CouponModule } from '../coupon/coupon.module';
import { NotificationModule } from '@app/notification';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';
import { PaymentModule } from '@app/payment';
import { RedisClientModule } from '@app/redis';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MallOrderEntity,
            MallOrderItemEntity,
            MallProductSkuEntity,
            MallPaymentEntity,
            MemberAddressEntity,
            FlashSaleProductEntity,
            MallProductEntity,
        ]),
        BullModule.registerQueue(
            {
                name: ORDER_QUEUE,
            },
            {
                name: LOG_QUEUE,
            }
        ),
        ShippingModule,
        CouponModule,
        NotificationModule,
        PaymentModule,
        RedisClientModule,
    ],
    controllers: [OrderController],
    providers: [OrderService, OrderProcessor, LogInterceptor],
    exports: [OrderService],
})
export class OrderModule {}
