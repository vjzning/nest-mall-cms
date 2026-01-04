import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FLASH_SALE_ORDER_QUEUE } from '@app/queue';
import { FlashSaleProductEntity, MallProductSkuEntity } from '@app/db';
import { OrderService } from '../../order/order.service';

@Processor(FLASH_SALE_ORDER_QUEUE)
export class FlashSaleOrderProcessor extends WorkerHost {
    private readonly logger = new Logger(FlashSaleOrderProcessor.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly orderService: OrderService
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        if (job.name === 'create_order') {
            return this.handleCreateOrder(job.data);
        }
    }

    private async handleCreateOrder(data: any) {
        const { memberId, activityId, skuId, addressId } = data;
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. 获取秒杀商品信息
            const flashProduct = await queryRunner.manager.findOne(
                FlashSaleProductEntity,
                {
                    where: { activityId, skuId },
                }
            );

            if (!flashProduct) {
                throw new Error('Flash sale product not found');
            }

            // 2. 获取 SKU 和 产品信息
            const sku = await queryRunner.manager.findOne(
                MallProductSkuEntity,
                {
                    where: { id: skuId },
                    relations: ['product'],
                }
            );

            if (!sku) {
                throw new Error('SKU not found');
            }

            // 3. 调用 OrderService 创建订单
            const savedOrder = await this.orderService.createFlashSaleOrder(
                queryRunner.manager,
                {
                    memberId,
                    flashProduct,
                    sku,
                    addressId,
                }
            );

            // 4. 更新数据库库存和销量
            // 注意：Redis 已经扣减过了，这里同步更新数据库
            // 使用 QueryBuilder 进行原子更新，避免 stock 变成负数导致的 Out of range 错误
            await queryRunner.manager
                .createQueryBuilder()
                .update(MallProductSkuEntity)
                .set({ stock: () => 'stock - 1' })
                .where('id = :skuId AND stock >= 1', { skuId })
                .execute();

            await queryRunner.manager
                .createQueryBuilder()
                .update(FlashSaleProductEntity)
                .set({
                    stock: () => 'stock - 1',
                    sales: () => 'sales + 1',
                })
                .where('id = :id AND stock >= 1', { id: flashProduct.id })
                .execute();

            await queryRunner.commitTransaction();
            this.logger.log(
                `Order created successfully: ${savedOrder.orderNo}`
            );
            return savedOrder;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(
                `Failed to create order for member ${memberId}: ${error.message}`
            );
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
