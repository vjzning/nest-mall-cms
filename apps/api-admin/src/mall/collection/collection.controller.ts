import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import { CollectionAdminService } from './collection.service';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';
import { RequirePermissions } from '../../common/decorators/auth.decorator';
import { CreateCollectionDto, UpdateCollectionDto, CreateCollectionItemDto } from './dto/collection.dto';

@Controller('mall/collections')
@UseInterceptors(LogInterceptor)
export class CollectionAdminController {
    constructor(private readonly collectionService: CollectionAdminService) {}

    /**
     * 创建合集
     */
    @Post()
    @RequirePermissions('mall:collection:create')
    @Log({ module: '合集管理', action: '创建合集' })
    async create(@Body() data: CreateCollectionDto) {
        return this.collectionService.createCollection(data as any);
    }

    /**
     * 合集列表
     */
    @Get()
    @RequirePermissions('mall:collection:list')
    async list(@Query('page') page = 1, @Query('limit') limit = 10, @Query('keyword') keyword?: string) {
        return this.collectionService.listCollections({
            skip: (page - 1) * limit,
            take: limit,
            keyword,
        });
    }

    /**
     * 合集详情
     */
    @Get(':id')
    @RequirePermissions('mall:collection:query')
    async getOne(@Param('id') id: string) {
        return this.collectionService.getCollectionDetail(+id);
    }

    /**
     * 更新合集
     */
    @Put(':id')
    @RequirePermissions('mall:collection:update')
    @Log({ module: '合集管理', action: '修改合集' })
    async update(
        @Param('id') id: string,
        @Body() data: UpdateCollectionDto
    ) {
        return this.collectionService.updateCollection(+id, data as any);
    }

    /**
     * 删除合集
     */
    @Delete(':id')
    @RequirePermissions('mall:collection:delete')
    @Log({ module: '合集管理', action: '删除合集' })
    async delete(@Param('id') id: string) {
        return this.collectionService.deleteCollection(+id);
    }

    /**
     * 添加合集项
     */
    @Post(':id/items')
    @RequirePermissions('mall:collection:update')
    @Log({ module: '合集管理', action: '添加合集项' })
    async addItems(@Param('id') id: string, @Body() items: CreateCollectionItemDto[]) {
        return this.collectionService.addItems(+id, items as any);
    }
}
