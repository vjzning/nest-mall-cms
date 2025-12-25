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
    const collection = this.collectionRepo.create(data);
    return this.collectionRepo.save(collection);
  }

  async updateCollection(id: number, data: Partial<CollectionEntity>) {
    await this.collectionRepo.update(id, data);
    return this.collectionRepo.findOne({ where: { id } });
  }

  async deleteCollection(id: number) {
    // Should handle items deletion or cascade
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
