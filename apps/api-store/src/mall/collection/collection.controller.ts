import { Controller, Get, Param, Query } from '@nestjs/common';
import { CollectionService } from './collection.service';

@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) { }

  @Get('active')
  async getActiveCollections() {
    return this.collectionService.getActiveCollections();
  }

  @Get(':code')
  async getByCode(@Param('code') code: string) {
    return this.collectionService.getCollectionByCode(code);
  }
}
