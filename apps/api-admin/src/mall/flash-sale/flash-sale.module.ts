import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashSaleActivityEntity, FlashSaleProductEntity } from '@app/db';
import { FlashSaleService } from './flash-sale.service';
import { FlashSaleController } from './flash-sale.controller';
import { RedisClientModule } from '@app/redis';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FLASH_SALE_ORDER_QUEUE } from '@app/queue';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            FlashSaleActivityEntity,
            FlashSaleProductEntity,
        ]),
        BullModule.registerQueue({
            name: FLASH_SALE_ORDER_QUEUE,
        }),
        BullBoardModule.forFeature({
            name: FLASH_SALE_ORDER_QUEUE,
            adapter: BullMQAdapter,
        }),
        RedisClientModule,
    ],
    providers: [FlashSaleService],
    controllers: [FlashSaleController],
    exports: [FlashSaleService],
})
export class FlashSaleModule {}
