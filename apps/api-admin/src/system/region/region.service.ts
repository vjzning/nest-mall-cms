import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegionEntity } from '@app/db';

@Injectable()
export class RegionService {
    constructor(
        @InjectRepository(RegionEntity)
        private readonly regionRepo: Repository<RegionEntity>
    ) {}

    /**
     * 获取省市区树形结构
     */
    async getTree() {
        const allRegions = await this.regionRepo.find({
            order: { sort: 'ASC', code: 'ASC' },
        });

        return this.buildTree(allRegions, null);
    }

    /**
     * 获取下级地区
     * @param parentCode 父级编码
     */
    async getChildren(parentCode: string) {
        return this.regionRepo.find({
            where: { parentCode },
            order: { sort: 'ASC', code: 'ASC' },
        });
    }

    /**
     * 获取省份列表
     */
    async getProvinces() {
        return this.regionRepo.find({
            where: { level: 1 },
            order: { sort: 'ASC', code: 'ASC' },
        });
    }

    private buildTree(
        regions: RegionEntity[],
        parentCode: string | null
    ): any[] {
        return regions
            .filter((r) => r.parentCode === parentCode)
            .map((r) => ({
                id: r.id,
                name: r.name,
                code: r.code,
                level: r.level,
                children: this.buildTree(regions, r.code),
            }));
    }

    /**
     * 初始化数据 (内部使用)
     */
    async seed(data: any[]) {
        return this.regionRepo.manager.transaction(async (manager) => {
            // 先清空旧数据 (谨慎使用)
            // await manager.clear(RegionEntity);

            const entities = data.map((item) => {
                const entity = manager.create(RegionEntity, {
                    name: item.name,
                    code: item.code,
                    parentCode: item.parentCode || null,
                    level: item.level,
                    sort: item.sort || 0,
                });
                return entity;
            });

            // 分批插入，避免 SQL 过长
            const batchSize = 500;
            for (let i = 0; i < entities.length; i += batchSize) {
                await manager.save(
                    RegionEntity,
                    entities.slice(i, i + batchSize)
                );
            }
            return entities.length;
        });
    }
}
