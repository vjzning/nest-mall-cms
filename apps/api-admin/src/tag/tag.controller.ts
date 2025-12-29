import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UseInterceptors } from '@nestjs/common';
import { TagService } from './tag.service';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('tag')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LogInterceptor)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @RequirePermissions('cms:tag:create')
  @Log({ module: '内容管理', action: '创建标签' })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto);
  }

  @Get()
  @RequirePermissions('cms:tag:list')
  findAll() {
    return this.tagService.findAll();
  }

  @Get(':id')
  @RequirePermissions('cms:tag:query')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(+id);
  }

  @Put(':id')
  @RequirePermissions('cms:tag:update')
  @Log({ module: '内容管理', action: '修改标签' })
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(+id, updateTagDto);
  }

  @Delete(':id')
  @RequirePermissions('cms:tag:delete')
  @Log({ module: '内容管理', action: '删除标签' })
  remove(@Param('id') id: string) {
    return this.tagService.remove(+id);
  }
}
