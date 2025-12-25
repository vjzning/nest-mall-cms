import { Controller, Get, Delete, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { ResourceService } from './resource.service';
import { StorageService } from '@app/storage';

@Controller('resource')
@UseGuards(AuthGuard('jwt'))
export class ResourceController {
  constructor(
    private readonly resourceService: ResourceService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @RequirePermissions('content:resource:list')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('filename') filename?: string,
  ) {
    return this.resourceService.findAll(page, limit, filename);
  }

  @Delete(':id')
  @RequirePermissions('content:resource:delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.storageService.remove(id);
  }
}
