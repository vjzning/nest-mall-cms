import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MallProductEntity } from '@app/db/entities/mall-product.entity';
import { MallProductSkuEntity } from '@app/db/entities/mall-product-sku.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MallCategoryEntity } from '@app/db/entities/mall-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MallProductEntity, MallProductSkuEntity, MallCategoryEntity])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
