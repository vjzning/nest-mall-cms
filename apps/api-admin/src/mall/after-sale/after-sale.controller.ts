import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Patch,
    UseInterceptors,
} from '@nestjs/common';
import { AfterSaleService } from './after-sale.service';
import {
    QueryAfterSaleDto,
    AuditAfterSaleDto,
    ResendLogisticsDto,
} from './dto/after-sale.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';
import { RequirePermissions } from '../../common/decorators/auth.decorator';

@ApiTags('售后管理')
@Controller('mall/after-sales')
@UseGuards(JwtAuthGuard)
@UseInterceptors(LogInterceptor)
export class AfterSaleController {
    constructor(private readonly afterSaleService: AfterSaleService) {}

    /**
     * 售后列表
     */
    @Get()
    @RequirePermissions('mall:after-sale:list')
    async list(@Query() query: QueryAfterSaleDto) {
        return this.afterSaleService.list(query);
    }

    /**
     * 售后详情
     */
    @Get(':id')
    @RequirePermissions('mall:after-sale:query')
    async detail(@Param('id') id: number) {
        return this.afterSaleService.detail(id);
    }

    /**
     * 审核售后申请
     */
    @Patch(':id/audit')
    @RequirePermissions('mall:after-sale:audit')
    @Log({ module: '售后管理', action: '审核售后申请' })
    async audit(@Param('id') id: number, @Body() dto: AuditAfterSaleDto) {
        return this.afterSaleService.audit(id, dto);
    }

    /**
     * 确认收到退货
     */
    @Patch(':id/confirm-receipt')
    @RequirePermissions('mall:after-sale:receipt')
    @Log({ module: '售后管理', action: '确认收到退货' })
    async confirmReceipt(@Param('id') id: number) {
        return this.afterSaleService.confirmReceipt(id);
    }

    /**
     * 填写补发物流
     */
    @Post(':id/resend')
    @RequirePermissions('mall:after-sale:resend')
    @Log({ module: '售后管理', action: '填写补发物流' })
    async resendLogistics(
        @Param('id') id: number,
        @Body() dto: ResendLogisticsDto
    ) {
        return this.afterSaleService.resendLogistics(id, dto);
    }
}
