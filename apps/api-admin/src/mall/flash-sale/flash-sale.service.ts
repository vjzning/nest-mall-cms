import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FlashSaleActivityEntity, FlashSaleProductEntity } from '@app/db';
import {
    CreateFlashSaleActivityDto,
    UpdateFlashSaleActivityDto,
} from './dto/flash-sale-activity.dto';
import { RedisClientService } from '@app/redis';

@Injectable()
export class FlashSaleService {
    constructor(
        @InjectRepository(FlashSaleActivityEntity)
        private readonly activityRepo: Repository<FlashSaleActivityEntity>,
        @InjectRepository(FlashSaleProductEntity)
        private readonly productRepo: Repository<FlashSaleProductEntity>,
        private readonly dataSource: DataSource,
        private readonly redis: RedisClientService
    ) {}

    async create(dto: CreateFlashSaleActivityDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { products, ...activityData } = dto;
            const activity = this.activityRepo.create(activityData);
            const savedActivity = await queryRunner.manager.save(activity);

            if (products && products.length > 0) {
                const productEntities = products.map((p) =>
                    this.productRepo.create({
                        ...p,
                        activityId: savedActivity.id,
                    })
                );
                await queryRunner.manager.save(productEntities);
            }

            await queryRunner.commitTransaction();
            return this.findOne(savedActivity.id);
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll() {
        return this.activityRepo.find({
            order: { startTime: 'DESC' },
        });
    }

    async findOne(id: number) {
        const activity = await this.activityRepo.findOne({
            where: { id },
        });
        if (!activity) throw new NotFoundException('活动不存在');

        const products = await this.productRepo.find({
            where: { activityId: id },
            relations: ['product', 'sku'],
            order: { sort: 'ASC' },
        });

        return { ...activity, products };
    }

    async update(id: number, dto: UpdateFlashSaleActivityDto) {
        await this.activityRepo.update(id, dto);
        await this.clearCache(id);
        return this.findOne(id);
    }

    async delete(id: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.delete(FlashSaleProductEntity, {
                activityId: id,
            });
            await queryRunner.manager.delete(FlashSaleActivityEntity, id);
            await queryRunner.commitTransaction();
            await this.clearCache(id);
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * 清理秒杀缓存
     */
    private async clearCache(id?: number) {
        const client = await this.redis.getClient();
        const keys = ['flash_sale:activities:list'];
        if (id) {
            keys.push(`flash_sale:activity:detail:${id}`);
        }
        for (const key of keys) {
            await client.del(key);
        }
    }

    /**
     * 预热库存到 Redis
     */
    async warmup(id: number) {
        const activity = await this.findOne(id);
        const client = await this.redis.getClient();

        // 计算过期时间：活动结束时间 + 1天
        const now = new Date();
        const endTime = new Date(activity.endTime);
        const ttl =
            Math.floor((endTime.getTime() - now.getTime()) / 1000) + 86400;

        for (const p of activity.products) {
            const stockKey = `flash_sale:stock:${p.skuId}`;
            const limitKey = `flash_sale:limit:${p.skuId}`;

            if (ttl > 0) {
                await (client as any).set(stockKey, String(p.stock), 'EX', ttl);
                await (client as any).set(
                    limitKey,
                    String(p.limitPerUser),
                    'EX',
                    ttl
                );
            } else {
                // 如果活动已结束超过1天，则不设置或设置一个较短的过期时间
                await (client as any).set(
                    stockKey,
                    String(p.stock),
                    'EX',
                    3600
                );
                await (client as any).set(
                    limitKey,
                    String(p.limitPerUser),
                    'EX',
                    3600
                );
            }
        }

        return { success: true };
    }
}
