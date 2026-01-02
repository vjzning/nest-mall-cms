import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
    NotificationEntity,
    NotificationSettingEntity,
    UserEntity,
    MemberEntity,
} from '@app/db';
import {
    NotificationPayload,
    NotificationChannel,
} from './interfaces/notification.interface';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private channels: Map<string, NotificationChannel> = new Map();

    constructor(
        @InjectRepository(NotificationEntity)
        private readonly notificationRepo: Repository<NotificationEntity>,
        @InjectRepository(NotificationSettingEntity)
        private readonly settingRepo: Repository<NotificationSettingEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(MemberEntity)
        private readonly memberRepo: Repository<MemberEntity>
    ) {}

    /**
     * 注册发送渠道
     */
    registerChannel(channel: NotificationChannel) {
        this.channels.set(channel.getName(), channel);
    }

    /**
     * 发送通知
     */
    async send(payload: NotificationPayload) {
        // 0. 获取该类型的配置
        let setting = await this.settingRepo.findOne({
            where: { type: payload.type },
        });

        // 如果没有特定配置，尝试获取默认配置
        if (!setting) {
            setting = await this.settingRepo.findOne({
                where: { type: 'DEFAULT' },
            });
        }

        // 如果配置被禁用，则不发送
        if (setting && !setting.isEnabled) {
            this.logger.log(
                `Notification type ${payload.type} is disabled by settings.`
            );
            return null;
        }

        // 1. 记录到数据库 (WebUI 渠道默认都会记录)
        const notification = this.notificationRepo.create({
            ...payload,
            isRead: 0,
        });
        const savedNotification =
            await this.notificationRepo.save(notification);

        // 2. 决定发送渠道
        // 优先级: payload 指定的渠道 -> 配置中的渠道 -> 默认 ['WEB']
        let targetChannels = payload.channels;

        if (!targetChannels && setting && setting.channels) {
            targetChannels = setting.channels;
        }

        if (!targetChannels || targetChannels.length === 0) {
            targetChannels = ['WEB'];
        }

        // 3. 准备接收者信息 (特别是邮箱)
        const emails = new Set<string>(payload.extraEmails || []);

        // 如果是 ADMIN 类型，从配置中获取管理员邮箱
        if (payload.targetType === 'ADMIN') {
            if (setting?.adminEmails) {
                setting.adminEmails.forEach((email) => emails.add(email));
            }
            if (setting?.adminUserIds && setting.adminUserIds.length > 0) {
                const adminUsers = await this.userRepo.find({
                    where: { id: In(setting.adminUserIds) },
                    select: ['email'],
                });
                adminUsers.forEach((u) => u.email && emails.add(u.email));
            }
        }

        // 如果指定了具体的 targetId，获取该用户的邮箱
        if (payload.targetId) {
            if (payload.targetType === 'USER') {
                const member = await this.memberRepo.findOne({
                    where: { id: payload.targetId },
                    select: ['email'],
                });
                if (member?.email) emails.add(member.email);
            } else {
                const admin = await this.userRepo.findOne({
                    where: { id: payload.targetId },
                    select: ['email'],
                });
                if (admin?.email) emails.add(admin.email);
            }
        }

        const finalPayload = { ...payload, extraEmails: Array.from(emails) };

        for (const channelName of targetChannels) {
            if (channelName === 'WEB') continue; // WEB 渠道已经在数据库记录中体现

            const channel = this.channels.get(channelName);
            if (channel) {
                try {
                    await channel.send(finalPayload);
                } catch (error) {
                    this.logger.error(
                        `Failed to send notification via ${channelName}: ${error.message}`
                    );
                }
            } else {
                this.logger.warn(`Channel ${channelName} not registered`);
            }
        }

        return savedNotification;
    }

    /**
     * 获取未读通知数量
     */
    async getUnreadCount(targetType: 'USER' | 'ADMIN', targetId: number) {
        return this.notificationRepo.count({
            where: { targetType, targetId, isRead: 0 },
        });
    }

    /**
     * 标记为已读
     */
    async markAsRead(id: number) {
        await this.notificationRepo.update(id, { isRead: 1 });
    }

    /**
     * 标记全部已读
     */
    async markAllAsRead(targetType: 'USER' | 'ADMIN', targetId: number) {
        await this.notificationRepo.update(
            { targetType, targetId, isRead: 0 },
            { isRead: 1 }
        );
    }
}
