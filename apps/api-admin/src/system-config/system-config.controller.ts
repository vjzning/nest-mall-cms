import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    ParseIntPipe,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { SystemConfigController as SharedSystemConfigController } from '@app/shared/system-config/system-config.controller';
import { SystemConfigEntity } from '@app/db/entities/system-config.entity';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('system-config')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LogInterceptor)
export class SystemConfigController extends SharedSystemConfigController {
    @Get()
    @RequirePermissions('system:config:list')
    override async findAll() {
        return super.findAll();
    }

    @Post()
    @RequirePermissions('system:config:create')
    @Log({ module: '系统配置', action: '创建配置' })
    override async create(@Body() data: Partial<SystemConfigEntity>) {
        return super.create(data);
    }

    @Put(':id')
    @RequirePermissions('system:config:update')
    @Log({ module: '系统配置', action: '修改配置' })
    override async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: Partial<SystemConfigEntity>
    ) {
        return super.update(id, data);
    }

    @Delete(':id')
    @RequirePermissions('system:config:delete')
    @Log({ module: '系统配置', action: '删除配置' })
    override async remove(@Param('id', ParseIntPipe) id: number) {
        return super.remove(id);
    }

    @Post('refresh')
    @RequirePermissions('system:config:update')
    @Log({ module: '系统配置', action: '刷新配置' })
    override async refresh() {
        return super.refresh();
    }
}
