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
import { CollectionEntity } from '@app/db';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('mall/collections')
@UseInterceptors(LogInterceptor)
export class CollectionAdminController {
    constructor(private readonly collectionService: CollectionAdminService) {}

    @Post()
    @Log({ module: '合集管理', action: '创建合集' })
    async create(@Body() data: Partial<CollectionEntity>) {
        return this.collectionService.createCollection(data);
    }

    @Get()
    async list(@Query('page') page = 1, @Query('limit') limit = 10) {
        return this.collectionService.listCollections({
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    @Get(':id')
    async getOne(@Param('id') id: number) {
        return this.collectionService.getCollectionDetail(id);
    }

    @Put(':id')
    @Log({ module: '合集管理', action: '修改合集' })
    async update(
        @Param('id') id: number,
        @Body() data: Partial<CollectionEntity>
    ) {
        return this.collectionService.updateCollection(id, data);
    }

    @Delete(':id')
    @Log({ module: '合集管理', action: '删除合集' })
    async delete(@Param('id') id: number) {
        return this.collectionService.deleteCollection(id);
    }

    @Post(':id/items')
    @Log({ module: '合集管理', action: '添加合集项' })
    async addItems(@Param('id') id: number, @Body() items: any[]) {
        return this.collectionService.addItems(id, items);
    }
}
