import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { SystemConfigController as SharedSystemConfigController } from '@app/shared/system-config/system-config.controller';
import { SystemConfigEntity } from '@app/db/entities/system-config.entity';

@Controller('system-config')
@UseGuards(AuthGuard('jwt'))
export class SystemConfigController extends SharedSystemConfigController {
    @Get()
    @RequirePermissions('system:config:list')
    override async findAll() {
        return super.findAll();
    }

    @Post()
    @RequirePermissions('system:config:create')
    override async create(@Body() data: Partial<SystemConfigEntity>) {
        return super.create(data);
    }

    @Put(':id')
    @RequirePermissions('system:config:update')
    override async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: Partial<SystemConfigEntity>
    ) {
        return super.update(id, data);
    }

    @Delete(':id')
    @RequirePermissions('system:config:delete')
    override async remove(@Param('id', ParseIntPipe) id: number) {
        return super.remove(id);
    }

    @Post('refresh')
    @RequirePermissions('system:config:update')
    override async refresh() {
        return super.refresh();
    }
}
