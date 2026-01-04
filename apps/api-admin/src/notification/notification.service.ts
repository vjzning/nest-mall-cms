import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity, NotificationSettingEntity } from '@app/db';

@Injectable()
export class NotificationService implements OnModuleInit {
    constructor(
        @InjectRepository(NotificationEntity)
        private readonly notificationRepo: Repository<NotificationEntity>,
        @InjectRepository(NotificationSettingEntity)
        private readonly settingRepo: Repository<NotificationSettingEntity>
    ) {}

    async onModuleInit() {
        await this.initDefaultSettings();
    }

    private async initDefaultSettings() {
        const count = await this.settingRepo.count();
        if (count > 0) return;

        console.log('Initializing default notification settings...');
        const defaults = [
            {
                type: 'DEFAULT',
                description: '默认通知设置',
                isEnabled: true,
                channels: ['WEB'],
            },
            {
                type: 'ORDER_TIMEOUT',
                description: '订单处理超时通知',
                isEnabled: true,
                channels: ['WEB', 'EMAIL'],
            },
            {
                type: 'AFTERSALE_TIMEOUT',
                description: '售后处理超时通知',
                isEnabled: true,
                channels: ['WEB', 'EMAIL'],
            },
            {
                type: 'NEW_ORDER',
                description: '新订单通知',
                isEnabled: true,
                channels: ['WEB'],
            },
            {
                type: 'NEW_AFTERSALE',
                description: '新售后申请通知',
                isEnabled: true,
                channels: ['WEB'],
            },
            {
                type: 'STOCK_ZERO',
                description: '库存预警通知',
                isEnabled: true,
                channels: ['WEB', 'EMAIL'],
            },
        ];

        for (const item of defaults) {
            await this.settingRepo.save(this.settingRepo.create(item));
        }
    }

    async findAll(query: {
        targetType?: 'USER' | 'ADMIN';
        targetId?: number;
        page?: number;
        limit?: number;
    }) {
        const { targetType, targetId, page = 1, limit = 10 } = query;
        const qb = this.notificationRepo.createQueryBuilder('n');

        if (targetType) {
            qb.andWhere('n.targetType = :targetType', { targetType });
        }
        if (targetId) {
            qb.andWhere('n.targetId = :targetId', { targetId });
        }

        qb.orderBy('n.createdAt', 'DESC');
        qb.skip((page - 1) * limit);
        qb.take(limit);

        const [items, total] = await qb.getManyAndCount();
        return { items, total };
    }

    async markAsRead(id: number) {
        await this.notificationRepo.update(id, { isRead: 1 });
        return true;
    }

    async markAllAsRead(targetType: 'USER' | 'ADMIN', targetId: number) {
        await this.notificationRepo.update(
            { targetType, targetId, isRead: 0 },
            { isRead: 1 }
        );
        return true;
    }

    async getUnreadCount(targetType: 'USER' | 'ADMIN', targetId: number) {
        return this.notificationRepo.count({
            where: { targetType, targetId, isRead: 0 },
        });
    }

    // --- 通知设置管理 ---

    async findAllSettings() {
        return this.settingRepo.find();
    }

    async createSetting(data: Partial<NotificationSettingEntity>) {
        const setting = this.settingRepo.create(data);
        return this.settingRepo.save(setting);
    }

    async updateSetting(id: number, data: Partial<NotificationSettingEntity>) {
        await this.settingRepo.update(id, data);
        return this.settingRepo.findOne({ where: { id } });
    }
}
