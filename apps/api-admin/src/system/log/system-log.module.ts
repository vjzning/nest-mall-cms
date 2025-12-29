import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemLogEntity } from '@app/db';
import { LogProcessor } from './queue/log.processor';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { LOG_QUEUE } from '@app/queue';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';
import { SystemLogService } from './system-log.service';
import { SystemLogController } from './system-log.controller';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([SystemLogEntity]),
        BullModule.registerQueue({
            name: LOG_QUEUE,
        }),
        BullBoardModule.forFeature({
            name: LOG_QUEUE,
            adapter: BullMQAdapter,
        }),
    ],
    controllers: [SystemLogController],
    providers: [LogProcessor, LogInterceptor, SystemLogService],
    exports: [TypeOrmModule, BullModule, LogInterceptor, SystemLogService],
})
export class SystemLogModule {}
