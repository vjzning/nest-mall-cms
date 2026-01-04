import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import {
    FlashSaleActivityEntity,
    FlashSaleProductEntity,
    MallOrderEntity,
    MallOrderItemEntity,
    MallProductSkuEntity,
} from '@app/db';
import { RedisClientModule } from '@app/redis';
import { OrderModule } from '../order/order.module';
import { FlashSaleService } from './flash-sale.service';
import { FlashSaleController } from './flash-sale.controller';
import { FlashSaleOrderProcessor } from './queue/flash-sale.processor';
import { FLASH_SALE_ORDER_QUEUE } from '@app/queue';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            FlashSaleActivityEntity,
            FlashSaleProductEntity,
            MallOrderEntity,
            MallOrderItemEntity,
            MallProductSkuEntity,
        ]),
        BullModule.registerQueue({
            name: FLASH_SALE_ORDER_QUEUE,
        }),
        RedisClientModule,
        OrderModule,
    ],
    providers: [FlashSaleService, FlashSaleOrderProcessor],
    controllers: [FlashSaleController],
    exports: [FlashSaleService],
})
export class FlashSaleModule {}
