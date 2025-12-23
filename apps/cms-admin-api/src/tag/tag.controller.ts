import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { TagService } from './tag.service';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller('tag')
@UseGuards(AuthGuard('jwt'))
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @RequirePermissions('cms:tag:create')
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
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(+id, updateTagDto);
  }

  @Delete(':id')
  @RequirePermissions('cms:tag:delete')
  remove(@Param('id') id: string) {
    return this.tagService.remove(+id);
  }
}
