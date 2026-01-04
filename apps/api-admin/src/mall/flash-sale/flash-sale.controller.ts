import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    ParseIntPipe,
    UseInterceptors,
} from '@nestjs/common';
import { FlashSaleService } from './flash-sale.service';
import {
    CreateFlashSaleActivityDto,
    UpdateFlashSaleActivityDto,
} from './dto/flash-sale-activity.dto';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('mall/flash-sale')
@UseInterceptors(LogInterceptor)
export class FlashSaleController {
    constructor(private readonly flashSaleService: FlashSaleService) {}

    @Post()
    @Log({ module: '商城管理', action: '创建秒杀活动' })
    async create(@Body() dto: CreateFlashSaleActivityDto) {
        return this.flashSaleService.create(dto);
    }

    @Get()
    async findAll() {
        return this.flashSaleService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.flashSaleService.findOne(id);
    }

    @Put(':id')
    @Log({ module: '商城管理', action: '更新秒杀活动' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateFlashSaleActivityDto
    ) {
        return this.flashSaleService.update(id, dto);
    }

    @Delete(':id')
    @Log({ module: '商城管理', action: '删除秒杀活动' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.flashSaleService.delete(id);
    }

    @Post(':id/warmup')
    @Log({ module: '商城管理', action: '秒杀库存预热' })
    async warmup(@Param('id', ParseIntPipe) id: number) {
        return this.flashSaleService.warmup(id);
    }
}
