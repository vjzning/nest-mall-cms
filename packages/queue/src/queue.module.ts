import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                connection: {
                    host: configService.get('REDIS_HOST') ?? '127.0.0.1',
                    port: configService.get('REDIS_PORT') ?? 6379,
                    password: configService.get('REDIS_PASSWORD'),
                    db: configService.get('REDIS_DB') ?? 1,
                },
            }),
            inject: [ConfigService],
        }),
    ],
    exports: [BullModule],
})
export class QueueModule {}
