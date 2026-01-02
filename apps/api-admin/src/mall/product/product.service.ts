import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MallProductEntity } from '@app/db/entities/mall-product.entity';
import { MallProductSkuEntity } from '@app/db/entities/mall-product-sku.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NotificationService } from '@app/notification';

import { ProductQueryDto } from './dto/product-query.dto';
import { Like } from 'typeorm';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(MallProductEntity)
        private readonly productRepo: Repository<MallProductEntity>,
        @InjectRepository(MallProductSkuEntity)
        private readonly skuRepo: Repository<MallProductSkuEntity>,
        private readonly dataSource: DataSource,
        private readonly notificationService: NotificationService
    ) {}

    async create(createProductDto: CreateProductDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { skus, ...productData } = createProductDto;

            // 1. Save Product
            const product = this.productRepo.create(productData);
            const savedProduct = await queryRunner.manager.save(product);

            // 2. Save SKUs
            if (skus && skus.length > 0) {
                const skuEntities = skus.map((sku) =>
                    this.skuRepo.create({
                        ...sku,
                        productId: savedProduct.id,
                    })
                );
                await queryRunner.manager.save(skuEntities);
            }

            await queryRunner.commitTransaction();
            return this.findOne(savedProduct.id);
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(query: ProductQueryDto) {
        const { page = 1, limit = 10, name, categoryId, status } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (name) {
            where.name = Like(`%${name}%`);
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (status !== undefined) {
            where.status = status;
        }

        const [items, total] = await this.productRepo.findAndCount({
            where,
            order: { sort: 'DESC', createdAt: 'DESC' },
            relations: ['category'],
            skip,
            take: limit,
        });

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number) {
        const product = await this.productRepo.findOne({
            where: { id },
            relations: ['skus'],
        });
        if (!product) {
            throw new NotFoundException(`Product #${id} not found`);
        }
        return product;
    }

    async update(id: number, updateProductDto: UpdateProductDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { skus, ...productData } = updateProductDto;

            // 1. Update Product
            await queryRunner.manager.update(
                MallProductEntity,
                id,
                productData
            );

            // 2. Update SKUs (Full replacement strategy for simplicity, or complex diff)
            // For this version, we'll delete old SKUs and insert new ones if 'skus' is provided.
            // A better approach would be to check IDs and update existing ones.
            if (skus) {
                await queryRunner.manager.delete(MallProductSkuEntity, {
                    productId: id,
                });
                const skuEntities = skus.map((sku) =>
                    this.skuRepo.create({
                        ...sku,
                        productId: id,
                    })
                );
                await queryRunner.manager.save(skuEntities);

                // 检查库存是否为 0
                for (const sku of skus) {
                    if (sku.stock === 0) {
                        await this.notificationService.send({
                            targetType: 'ADMIN',
                            type: 'STOCK_ZERO',
                            title: '库存预警',
                            content: `商品 [${productData.name || '未知'}] 的规格 [${sku.code}] 库存已清零，请及时补货。`,
                            payload: { productId: id, skuCode: sku.code },
                            channels: ['WEB'],
                        });
                    }
                }
            }

            await queryRunner.commitTransaction();
            return this.findOne(id);
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async remove(id: number) {
        const product = await this.findOne(id);
        // Deleting SKUs first
        await this.skuRepo.delete({ productId: id });
        return this.productRepo.remove(product);
    }

    async generateMockData(count: number = 100) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const products: MallProductEntity[] = [];

            for (let i = 0; i < count; i++) {
                const product = this.productRepo.create({
                    name: `Mock Product ${i + 1} - ${Math.random().toString(36).substring(7)}`,
                    description: `This is a description for mock product ${i + 1}.`,
                    categoryId: 1, // Assuming category 1 exists or is root
                    cover: `https://picsum.photos/seed/${i}/200/200`,
                    images: [
                        `https://picsum.photos/seed/${i}-1/400/400`,
                        `https://picsum.photos/seed/${i}-2/400/400`,
                    ],
                    detail: `<p>Detailed content for product ${i + 1}</p>`,
                    status: Math.random() > 0.2 ? 1 : 0,
                    sort: Math.floor(Math.random() * 100),
                    sales: Math.floor(Math.random() * 1000),
                    viewCount: Math.floor(Math.random() * 5000),
                });
                products.push(product);
            }

            const savedProducts = await queryRunner.manager.save(products);

            // Generate random SKUs for each product
            const skus: MallProductSkuEntity[] = [];
            for (const p of savedProducts) {
                const skuCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 SKUs
                for (let j = 0; j < skuCount; j++) {
                    skus.push(
                        this.skuRepo.create({
                            productId: p.id,
                            code: `${p.id}-${j + 1}`,
                            specs: [
                                {
                                    key: 'Color',
                                    value: j === 0 ? 'Red' : 'Blue',
                                },
                            ],
                            price: Math.floor(Math.random() * 1000) + 10,
                            stock: Math.floor(Math.random() * 100),
                            marketPrice: Math.floor(Math.random() * 2000) + 20,
                        })
                    );
                }
            }

            await queryRunner.manager.save(skus);

            await queryRunner.commitTransaction();
            return { count: savedProducts.length };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
