import { Module } from '@nestjs/common';
import { PaymentModule } from '@app/payment';
import { MallPaymentController } from './payment/payment.controller';
import { ProductController } from './product/product.controller';
import { ProductService } from './product/product.service';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { OrderProcessor } from './order/queue/order.processor';
import { CollectionModule } from './collection/collection.module';
import { AfterSaleModule } from './after-sale/after-sale.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ORDER_QUEUE, LOG_QUEUE } from '@app/queue';
import { MallProductEntity } from '@app/db/entities/mall-product.entity';
import { MallProductSkuEntity } from '@app/db/entities/mall-product-sku.entity';
import { MallOrderEntity } from '@app/db/entities/mall-order.entity';
import { MallOrderItemEntity } from '@app/db/entities/mall-order-item.entity';
import { MemberEntity } from '@app/db/entities/member.entity';
import { MallPaymentEntity } from '@app/db/entities/mall-payment.entity';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Module({
    imports: [
        PaymentModule,
        TypeOrmModule.forFeature([
            MallProductEntity,
            MallProductSkuEntity,
            MallOrderEntity,
            MallOrderItemEntity,
            MemberEntity,
            MallPaymentEntity,
        ]),
        BullModule.registerQueue(
            {
                name: ORDER_QUEUE,
            },
            {
                name: LOG_QUEUE,
            }
        ),
        CollectionModule,
        AfterSaleModule,
    ],
    controllers: [MallPaymentController, ProductController, OrderController],
    providers: [ProductService, OrderService, OrderProcessor, LogInterceptor],
})
export class MallModule {}
