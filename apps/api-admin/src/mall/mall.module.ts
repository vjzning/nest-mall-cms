import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { AfterSaleModule } from './after-sale/after-sale.module';

import { CollectionAdminModule } from './collection/collection.module';

@Module({
  imports: [ProductModule, OrderModule, AfterSaleModule, CollectionAdminModule],
})
export class MallModule { }
