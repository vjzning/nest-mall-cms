import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { AfterSaleModule } from './after-sale/after-sale.module';
import { CollectionAdminModule } from './collection/collection.module';
import { CouponModule } from './coupon/coupon.module';
import { ShippingTemplateModule } from './shipping-template/shipping-template.module';

@Module({
  imports: [
    ProductModule,
    OrderModule,
    AfterSaleModule,
    CollectionAdminModule,
    CouponModule,
    ShippingTemplateModule,
  ],
})
export class MallModule { }
