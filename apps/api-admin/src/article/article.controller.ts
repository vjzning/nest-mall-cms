import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, Request, Patch, UseInterceptors } from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('article')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LogInterceptor)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @RequirePermissions('cms:article:create')
  @Log({ module: '内容管理', action: '创建文章' })
  create(@Body() createArticleDto: CreateArticleDto, @Request() req: any) {
    return this.articleService.create(createArticleDto, req.user);
  }

  @Get()
  @RequirePermissions('cms:article:list')
  async findAll(@Query() query: any) {
    const { page = 1, limit = 10 } = query;
    const [items, total] = await this.articleService.findAll(query);
    return {
      items,
      total,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(total / +limit),
    };
  }

  @Get(':id')
  @RequirePermissions('cms:article:query')
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(+id);
  }

  @Put(':id')
  @RequirePermissions('cms:article:update')
  @Log({ module: '内容管理', action: '修改文章' })
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.update(+id, updateArticleDto);
  }

  @Patch(':id/audit')
  @RequirePermissions('cms:article:audit')
  @Log({ module: '内容管理', action: '审核文章' })
  audit(@Param('id') id: string, @Body('status') status: number) {
    return this.articleService.audit(+id, status);
  }

  @Delete(':id')
  @RequirePermissions('cms:article:delete')
  @Log({ module: '内容管理', action: '删除文章' })
  remove(@Param('id') id: string) {
    return this.articleService.remove(+id);
  }
}
