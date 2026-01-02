import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';
import { RequirePermissions } from '../../common/decorators/auth.decorator';

@Controller('mall/products')
@UseInterceptors(LogInterceptor)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @RequirePermissions('mall:product:create')
  @Log({ module: '商品管理', action: '创建商品' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @RequirePermissions('mall:product:list')
  findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('mall:product:query')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('mall:product:update')
  @Log({ module: '商品管理', action: '修改商品' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @RequirePermissions('mall:product:delete')
  @Log({ module: '商品管理', action: '删除商品' })
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
