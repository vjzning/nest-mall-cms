import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('category')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LogInterceptor)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @RequirePermissions('cms:category:create')
  @Log({ module: '内容管理', action: '创建分类' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @RequirePermissions('cms:category:list')
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @RequirePermissions('cms:category:query')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Put(':id')
  @RequirePermissions('cms:category:update')
  @Log({ module: '内容管理', action: '修改分类' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @RequirePermissions('cms:category:delete')
  @Log({ module: '内容管理', action: '删除分类' })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
