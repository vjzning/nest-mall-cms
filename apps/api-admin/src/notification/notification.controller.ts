import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Param,
    Put,
    UseInterceptors,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('notifications')
@UseInterceptors(LogInterceptor)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    /**
     * 获取通知列表
     */
    @Get()
    async findAll(
        @Query('targetType') targetType?: 'USER' | 'ADMIN',
        @Query('targetId') targetId?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.notificationService.findAll({
            targetType,
            targetId: targetId ? Number(targetId) : undefined,
            page,
            limit,
        });
    }

    /**
     * 获取未读通知数量
     */
    @Get('unread-count')
    async getUnreadCount(
        @Query('targetType') targetType: 'USER' | 'ADMIN',
        @Query('targetId') targetId: string
    ) {
        return this.notificationService.getUnreadCount(
            targetType,
            Number(targetId)
        );
    }

    /**
     * 标记通知为已读
     */
    @Put(':id/read')
    @Log({ module: '系统通知', action: '标记已读' })
    async markAsRead(@Param('id') id: string) {
        return this.notificationService.markAsRead(Number(id));
    }

    /**
     * 标记所有通知为已读
     */
    @Post('read-all')
    @Log({ module: '系统通知', action: '全部标记已读' })
    async markAllAsRead(
        @Body('targetType') targetType: 'USER' | 'ADMIN',
        @Body('targetId') targetId: string
    ) {
        return this.notificationService.markAllAsRead(
            targetType,
            Number(targetId)
        );
    }
}
