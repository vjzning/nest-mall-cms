import {
    Controller,
    Get,
    Delete,
    Param,
    Query,
    UseGuards,
    ParseIntPipe,
    DefaultValuePipe,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { ResourceService } from './resource.service';
import { StorageService } from '@app/storage';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('resource')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LogInterceptor)
export class ResourceController {
    constructor(
        private readonly resourceService: ResourceService,
        private readonly storageService: StorageService
    ) {}

    @Get()
    @RequirePermissions('content:resource:list')
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query('filename') filename?: string
    ) {
        return this.resourceService.findAll(page, limit, filename);
    }

    @Delete(':id')
    @RequirePermissions('content:resource:delete')
    @Log({ module: '资源管理', action: '删除资源' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.storageService.remove(id);
    }
}
