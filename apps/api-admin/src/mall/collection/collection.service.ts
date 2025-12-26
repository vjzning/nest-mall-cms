import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionEntity, CollectionItemEntity } from '@app/db';
import { CollectionInfo, CollectionItemInfo } from '@app/shared';

@Injectable()
export class CollectionAdminService {
  constructor(
    @InjectRepository(CollectionEntity)
    private readonly collectionRepo: Repository<CollectionEntity>,
    @InjectRepository(CollectionItemEntity)
    private readonly itemRepo: Repository<CollectionItemEntity>,
  ) { }

  async createCollection(data: Partial<CollectionEntity>) {
    const { items, ...collectionData } = data;
    const collection = this.collectionRepo.create(collectionData);
    const savedCollection = await this.collectionRepo.save(collection);

    if (items && items.length > 0) {
      const itemEntities = items.map(item => {
        const entity = this.itemRepo.create(item);
        entity.collectionId = savedCollection.id;
        return entity;
      });
      await this.itemRepo.save(itemEntities);
    }

    return this.getCollectionDetail(savedCollection.id);
  }

  async updateCollection(id: number, data: Partial<CollectionEntity>) {
    const { items, ...updateData } = data;

    // Remove read-only or non-updatable fields
    delete (updateData as any).id;
    delete (updateData as any).createdAt;
    delete (updateData as any).updatedAt;

    if (Object.keys(updateData).length > 0) {
      await this.collectionRepo.update(id, updateData);
    }

    if (items) {
      // Replace items: delete old ones and insert new ones
      await this.itemRepo.delete({ collectionId: id });
      if (items.length > 0) {
        const itemEntities = items.map(item => {
          const entity = this.itemRepo.create(item);
          entity.collectionId = id;
          return entity;
        });
        await this.itemRepo.save(itemEntities);
      }
    }

    return this.getCollectionDetail(id);
  }

  async deleteCollection(id: number) {
    // Delete associated items first to avoid foreign key constraint error
    await this.itemRepo.delete({ collectionId: id });
    // Then delete the collection
    return this.collectionRepo.delete(id);
  }

  async addItems(collectionId: number, items: Partial<CollectionItemEntity>[]) {
    const entities = items.map(item => this.itemRepo.create({ ...item, collectionId }));
    return this.itemRepo.save(entities);
  }

  async listCollections(query: { skip?: number; take?: number } = {}) {
    const [items, total] = await this.collectionRepo.findAndCount({
      order: { sort: 'ASC', createdAt: 'DESC' },
      skip: query.skip || 0,
      take: query.take || 10,
    });
    return { items, total };
  }

  async getCollectionDetail(id: number) {
    return this.collectionRepo.findOne({
      where: { id },
      relations: ['items'],
    });
  }
}
