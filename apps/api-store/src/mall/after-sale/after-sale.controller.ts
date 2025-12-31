import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    UseInterceptors,
} from '@nestjs/common';
import { AfterSaleService } from './after-sale.service';
import { ApplyAfterSaleDto, SubmitLogisticsDto } from './dto/after-sale.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AfterSaleStatus } from '@app/db/entities/mall-after-sale.entity';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('mall/after-sales')
@UseGuards(JwtAuthGuard)
export class AfterSaleController {
    constructor(private readonly afterSaleService: AfterSaleService) {}

    @Get('refundable-info/:orderId')
    async getRefundableInfo(@Param('orderId') orderId: number, @Request() req) {
        return this.afterSaleService.getRefundableInfo(orderId, req.user.id);
    }

    @Post('apply')
    @Log({ module: '售后管理', action: '申请售后' })
    @UseInterceptors(LogInterceptor)
    async apply(@Body() dto: ApplyAfterSaleDto, @Request() req) {
        return this.afterSaleService.apply(dto, req.user.id);
    }

    @Get()
    async list(
        @Query('status') status: AfterSaleStatus,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Request() req
    ) {
        return this.afterSaleService.list(req.user.id, status, page, limit);
    }

    @Get(':id')
    async detail(@Param('id') id: number, @Request() req) {
        return this.afterSaleService.detail(id, req.user.id);
    }

    @Post(':id/cancel')
    @Log({ module: '售后管理', action: '取消售后申请' })
    @UseInterceptors(LogInterceptor)
    async cancel(@Param('id') id: number, @Request() req) {
        return this.afterSaleService.cancel(id, req.user.id);
    }

    @Post(':id/logistics')
    @Log({ module: '售后管理', action: '提交退货物流' })
    @UseInterceptors(LogInterceptor)
    async submitLogistics(
        @Param('id') id: number,
        @Body() dto: SubmitLogisticsDto,
        @Request() req
    ) {
        return this.afterSaleService.submitLogistics(id, dto, req.user.id);
    }
}
