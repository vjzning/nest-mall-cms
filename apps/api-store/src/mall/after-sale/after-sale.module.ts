import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { LOG_QUEUE } from '@app/queue';
import { AfterSaleService } from './after-sale.service';
import { AfterSaleController } from './after-sale.controller';
import { MallAfterSaleEntity } from '@app/db/entities/mall-after-sale.entity';
import { MallAfterSaleItemEntity } from '@app/db/entities/mall-after-sale-item.entity';
import { MallAfterSaleLogisticsEntity } from '@app/db/entities/mall-after-sale-logistics.entity';
import { MallOrderEntity } from '@app/db/entities/mall-order.entity';
import { MallOrderItemEntity } from '@app/db/entities/mall-order-item.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MallAfterSaleEntity,
            MallAfterSaleItemEntity,
            MallAfterSaleLogisticsEntity,
            MallOrderEntity,
            MallOrderItemEntity,
        ]),
        BullModule.registerQueue({
            name: LOG_QUEUE,
        }),
    ],
    controllers: [AfterSaleController],
    providers: [AfterSaleService],
    exports: [AfterSaleService],
})
export class AfterSaleModule {}
