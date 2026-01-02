import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { AfterSaleModule } from './after-sale/after-sale.module';
import { CollectionAdminModule } from './collection/collection.module';
import { CouponModule } from './coupon/coupon.module';
import { ShippingTemplateModule } from './shipping-template/shipping-template.module';
import { MallCategoryModule } from './category/category.module';
import { MemberModule } from './member/member.module';

@Module({
  imports: [
    ProductModule,
    OrderModule,
    AfterSaleModule,
    CollectionAdminModule,
    CouponModule,
    ShippingTemplateModule,
    MallCategoryModule,
    MemberModule,
  ],
})
export class MallModule { }
