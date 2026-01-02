import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource } from 'typeorm';
import { CollectionEntity, CollectionItemEntity } from '@app/db';

@Injectable()
export class CollectionAdminService {
    constructor(
        @InjectRepository(CollectionEntity)
        private readonly collectionRepo: Repository<CollectionEntity>,
        @InjectRepository(CollectionItemEntity)
        private readonly itemRepo: Repository<CollectionItemEntity>,
        private readonly dataSource: DataSource
    ) {}

    async createCollection(data: Partial<CollectionEntity>) {
        return await this.dataSource.transaction(async (manager) => {
            const { items, ...collectionData } = data;
            const collectionRepo = manager.getRepository(CollectionEntity);
            const itemRepo = manager.getRepository(CollectionItemEntity);

            const collection = collectionRepo.create(collectionData);
            const savedCollection = await collectionRepo.save(collection);

            if (items && items.length > 0) {
                const itemEntities = items.map((item) => {
                    const entity = itemRepo.create(item);
                    entity.collectionId = savedCollection.id;
                    return entity;
                });
                await itemRepo.save(itemEntities);
            }

            return collectionRepo.findOne({
                where: { id: savedCollection.id },
                relations: ['items'],
            });
        });
    }

    async updateCollection(id: number, data: Partial<CollectionEntity>) {
        return await this.dataSource.transaction(async (manager) => {
            const { items, ...updateData } = data;
            const collectionRepo = manager.getRepository(CollectionEntity);
            const itemRepo = manager.getRepository(CollectionItemEntity);

            // Remove read-only or non-updatable fields
            delete (updateData as any).id;
            delete (updateData as any).createdAt;
            delete (updateData as any).updatedAt;

            if (Object.keys(updateData).length > 0) {
                await collectionRepo.update(id, updateData);
            }

            if (items) {
                // Replace items: delete old ones and insert new ones
                await itemRepo.delete({ collectionId: id });
                if (items.length > 0) {
                    const itemEntities = items.map((item) => {
                        const entity = itemRepo.create(item);
                        entity.collectionId = id;
                        return entity;
                    });
                    await itemRepo.save(itemEntities);
                }
            }

            return collectionRepo.findOne({
                where: { id },
                relations: ['items'],
            });
        });
    }

    async deleteCollection(id: number) {
        // Delete associated items first to avoid foreign key constraint error
        await this.itemRepo.delete({ collectionId: id });
        // Then delete the collection
        return this.collectionRepo.delete(id);
    }

    async addItems(
        collectionId: number,
        items: Partial<CollectionItemEntity>[]
    ) {
        const entities = items.map((item) =>
            this.itemRepo.create({ ...item, collectionId })
        );
        return this.itemRepo.save(entities);
    }

    async listCollections(
        query: { skip?: number; take?: number; keyword?: string } = {}
    ) {
        const { skip = 0, take = 10, keyword } = query;
        const where: any = {};

        if (keyword) {
            where.title = Like(`%${keyword}%`);
        }

        const [items, total] = await this.collectionRepo.findAndCount({
            where: keyword
                ? [
                      { ...where, title: Like(`%${keyword}%`) },
                      { ...where, code: Like(`%${keyword}%`) },
                  ]
                : where,
            order: { sort: 'ASC', createdAt: 'DESC' },
            skip,
            take,
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
