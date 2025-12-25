import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CollectionAdminService } from './collection.service';
import { CollectionEntity } from '@app/db';

@Controller('mall/collections')
export class CollectionAdminController {
  constructor(private readonly collectionService: CollectionAdminService) { }

  @Post()
  async create(@Body() data: Partial<CollectionEntity>) {
    return this.collectionService.createCollection(data);
  }

  @Get()
  async list(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.collectionService.listCollections({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.collectionService.getCollectionDetail(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: Partial<CollectionEntity>) {
    return this.collectionService.updateCollection(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.collectionService.deleteCollection(id);
  }

  @Post(':id/items')
  async addItems(@Param('id') id: number, @Body() items: any[]) {
    return this.collectionService.addItems(id, items);
  }
}
