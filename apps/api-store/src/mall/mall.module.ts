import { Module } from '@nestjs/common';
import { PaymentModule } from '@app/payment';
import { NotificationModule } from '@app/notification';
import { MallPaymentController } from './payment/payment.controller';
import { ProductController } from './product/product.controller';
import { ProductService } from './product/product.service';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { OrderProcessor } from './order/queue/order.processor';
import { CollectionModule } from './collection/collection.module';
import { AfterSaleModule } from './after-sale/after-sale.module';
import { CouponModule } from './coupon/coupon.module';
import { ShippingModule } from './shipping/shipping.module';
import { FlashSaleModule } from './flash-sale/flash-sale.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ORDER_QUEUE, LOG_QUEUE, FLASH_SALE_ORDER_QUEUE } from '@app/queue';
import { MallProductEntity } from '@app/db/entities/mall-product.entity';
import { MallProductSkuEntity } from '@app/db/entities/mall-product-sku.entity';
import { MallOrderEntity } from '@app/db/entities/mall-order.entity';
import { MallOrderItemEntity } from '@app/db/entities/mall-order-item.entity';
import { MemberEntity } from '@app/db/entities/member.entity';
import { MallPaymentEntity } from '@app/db/entities/mall-payment.entity';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';
import { OrderModule } from './order/order.module';

@Module({
    imports: [
        PaymentModule,
        NotificationModule,
        TypeOrmModule.forFeature([
            MallProductEntity,
            MallProductSkuEntity,
            MemberEntity,
        ]),
        BullModule.registerQueue({
            name: LOG_QUEUE,
        }),
        CollectionModule,
        AfterSaleModule,
        CouponModule,
        ShippingModule,
        FlashSaleModule,
        OrderModule,
    ],
    controllers: [MallPaymentController, ProductController],
    providers: [ProductService, LogInterceptor],
})
export class MallModule {}
