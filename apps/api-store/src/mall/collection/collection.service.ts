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
      const productIds = collection.items.map(item => String(item.targetId));
      const products = await this.productRepo.find({
        where: { id: In(productIds) as any },
        relations: ['skus'],
      });

      // Ensure sorted as per items sequence
      const sortedProducts = productIds.map(id => {
        const p = products.find(prod => String(prod.id) === id);
        if (p) {
          const price = p.skus?.length > 0 ? Math.min(...p.skus.map(s => s.price)) : 0;
          return { ...p, price };
        }
        return null;
      }).filter(Boolean);

      (collection as any).products = sortedProducts;
    }

    return collection;
  }

  async getActiveCollections() {
    const collections = await this.collectionRepo.find({
      where: { status: 1 },
      order: { sort: 'ASC' },
      relations: ['items'],
    });

    for (const collection of collections) {
      if (collection.type === CollectionType.PRODUCT && collection.items.length > 0) {
        const productIds = collection.items.map(item => String(item.targetId));
        const products = await this.productRepo.find({
          where: { id: In(productIds) as any },
          relations: ['skus'],
        });

        // Ensure sorted as per items sequence
        const sortedProducts = productIds.map(id => {
          const p = products.find(prod => String(prod.id) === id);
          if (p) {
            const price = p.skus?.length > 0 ? Math.min(...p.skus.map(s => s.price)) : 0;
            return { ...p, price };
          }
          return null;
        }).filter(Boolean);

        (collection as any).products = sortedProducts;
      }
    }

    return collections;
  }
}
