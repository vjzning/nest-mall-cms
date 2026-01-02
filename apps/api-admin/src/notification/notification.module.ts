import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    NotificationEntity,
    NotificationTaskEntity,
    NotificationSettingEntity,
} from '@app/db';
import { NotificationController } from './notification.controller';
import { NotificationSettingController } from './notification-setting.controller';
import { NotificationService as AdminNotificationService } from './notification.service';
import { NotificationModule as CoreNotificationModule } from '@app/notification';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            NotificationEntity,
            NotificationTaskEntity,
            NotificationSettingEntity,
        ]),
        CoreNotificationModule,
    ],
    controllers: [NotificationController, NotificationSettingController],
    providers: [AdminNotificationService],
    exports: [AdminNotificationService, CoreNotificationModule],
})
export class NotificationAdminModule {}
