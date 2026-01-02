import { Module, Global, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    NotificationEntity,
    NotificationSettingEntity,
    UserEntity,
    MemberEntity,
} from '@app/db';
import { NotificationService } from './notification.service';
import { EmailChannel } from './channels/email.channel';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            NotificationEntity,
            NotificationSettingEntity,
            UserEntity,
            MemberEntity,
        ]),
    ],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule implements OnModuleInit {
    constructor(private readonly notificationService: NotificationService) {}

    onModuleInit() {
        // 注册邮件渠道
        this.notificationService.registerChannel(new EmailChannel());
    }
}
