import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    Request,
} from '@nestjs/common';
import { FlashSaleService } from './flash-sale.service';
import { FlashSaleOrderDto } from './dto/flash-sale.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('mall/flash-sale')
export class FlashSaleController {
    constructor(private readonly flashSaleService: FlashSaleService) {}

    @Get('activities')
    async getActivities() {
        return this.flashSaleService.getActivities();
    }

    @Get('activity/:id')
    async getActivityDetail(@Param('id', ParseIntPipe) id: number) {
        return this.flashSaleService.getActivityDetail(id);
    }

    @Post('order')
    @UseGuards(JwtAuthGuard)
    @Throttle({ default: { limit: 1, ttl: 1000 } }) // 针对下单接口，每秒最多 1 次请求
    async createOrder(@Request() req, @Body() dto: FlashSaleOrderDto) {
        return this.flashSaleService.createOrder(req.user.id, dto);
    }
}
