import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from './notification.service';
import { NotificationSettingEntity } from '@app/db';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('notification-settings')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LogInterceptor)
export class NotificationSettingController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    async findAll() {
        return this.notificationService.findAllSettings();
    }

    @Post()
    @Log({ module: '通知管理', action: '创建通知设置' })
    async create(@Body() data: Partial<NotificationSettingEntity>) {
        return this.notificationService.createSetting(data);
    }

    @Put(':id')
    @Log({ module: '通知管理', action: '修改通知设置' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: Partial<NotificationSettingEntity>
    ) {
        return this.notificationService.updateSetting(id, data);
    }
}
