import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';

import { CollectionAdminModule } from './collection/collection.module';

@Module({
  imports: [ProductModule, OrderModule, CollectionAdminModule],
})
export class MallModule { }
