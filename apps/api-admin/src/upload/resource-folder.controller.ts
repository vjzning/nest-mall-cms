import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    UseInterceptors,
    Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ResourceFolderService } from './resource-folder.service';
import {
    CreateResourceFolderDto,
    UpdateResourceFolderDto,
} from './dto/resource-folder.dto';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('resource-folders')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LogInterceptor)
export class ResourceFolderController {
    constructor(private readonly folderService: ResourceFolderService) {}

    @Get()
    @RequirePermissions('cms:resource:folder:list')
    findAll(@Query('parentId') parentId?: string) {
        return this.folderService.findAll(parentId ? +parentId : undefined);
    }

    @Get(':id')
    @RequirePermissions('cms:resource:folder:query')
    findOne(@Param('id') id: string) {
        return this.folderService.findOne(+id);
    }

    @Post()
    @RequirePermissions('cms:resource:folder:create')
    @Log({ module: '资源管理', action: '创建目录' })
    create(@Body() dto: CreateResourceFolderDto) {
        return this.folderService.create(dto);
    }

    @Patch(':id')
    @RequirePermissions('cms:resource:folder:update')
    @Log({ module: '资源管理', action: '更新目录' })
    update(@Param('id') id: string, @Body() dto: UpdateResourceFolderDto) {
        return this.folderService.update(+id, dto);
    }

    @Delete(':id')
    @RequirePermissions('cms:resource:folder:delete')
    @Log({ module: '资源管理', action: '删除目录' })
    remove(@Param('id') id: string) {
        return this.folderService.remove(+id);
    }
}
