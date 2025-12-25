import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CollectionEntity, CollectionItemEntity, MallProductEntity } from '@app/db';
import { CollectionType } from '@app/shared';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(CollectionEntity)
    private readonly collectionRepo: Repository<CollectionEntity>,
    @InjectRepository(CollectionItemEntity)
    private readonly itemRepo: Repository<CollectionItemEntity>,
    @InjectRepository(MallProductEntity)
    private readonly productRepo: Repository<MallProductEntity>,
  ) { }

  async getCollectionByCode(code: string) {
    const collection = await this.collectionRepo.findOne({
      where: { code, status: 1 },
      relations: ['items'],
      order: { items: { sort: 'ASC' } }
    });

    if (!collection) return null;

    // If it's a product collection, let's attach product info
    if (collection.type === CollectionType.PRODUCT && collection.items.length > 0) {
      const productIds = collection.items.map(item => item.targetId);
      const products = await this.productRepo.find({
        where: { id: In(productIds) }
      });

      // Map products back to items or a custom structure
      (collection as any).products = products;
    }

    return collection;
  }

  async getActiveCollections() {
    return this.collectionRepo.find({
      where: { status: 1 },
      order: { sort: 'ASC' },
      relations: ['items']
    });
  }
}
