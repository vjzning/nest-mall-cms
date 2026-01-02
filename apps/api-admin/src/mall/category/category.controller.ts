import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { MallCategoryService } from './category.service';
import { CreateMallCategoryDto, UpdateMallCategoryDto } from './dto/category.dto';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';
import { RequirePermissions } from '../../common/decorators/auth.decorator';

@Controller('mall/categories')
@UseInterceptors(LogInterceptor)
export class MallCategoryController {
  constructor(private readonly categoryService: MallCategoryService) {}

  @Post()
  @RequirePermissions('mall:category:create')
  @Log({ module: '商品分类', action: '创建分类' })
  create(@Body() createMallCategoryDto: CreateMallCategoryDto) {
    return this.categoryService.create(createMallCategoryDto);
  }

  @Get()
  @RequirePermissions('mall:category:list')
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @RequirePermissions('mall:category:query')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('mall:category:update')
  @Log({ module: '商品分类', action: '更新分类' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMallCategoryDto: UpdateMallCategoryDto) {
    return this.categoryService.update(id, updateMallCategoryDto);
  }

  @Delete(':id')
  @RequirePermissions('mall:category:delete')
  @Log({ module: '商品分类', action: '删除分类' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
