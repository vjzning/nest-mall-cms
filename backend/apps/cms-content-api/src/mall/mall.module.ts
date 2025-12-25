import { Module } from '@nestjs/common';
import { PaymentModule } from '@app/payment';
import { MallPaymentController } from './payment/payment.controller';
import { ProductController } from './product/product.controller';
import { ProductService } from './product/product.service';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MallProductEntity } from '@app/db/entities/mall-product.entity';
import { MallProductSkuEntity } from '@app/db/entities/mall-product-sku.entity';
import { MallOrderEntity } from '@app/db/entities/mall-order.entity';
import { MallOrderItemEntity } from '@app/db/entities/mall-order-item.entity';
import { MemberEntity } from '@app/db/entities/member.entity';

@Module({
  imports: [
    PaymentModule,
    TypeOrmModule.forFeature([
      MallProductEntity,
      MallProductSkuEntity,
      MallOrderEntity,
      MallOrderItemEntity,
      MemberEntity,
    ]),
  ],
  controllers: [MallPaymentController, ProductController, OrderController],
  providers: [ProductService, OrderService],
})
export class MallModule {}
