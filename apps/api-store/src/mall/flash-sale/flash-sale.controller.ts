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
    async createOrder(@Request() req, @Body() dto: FlashSaleOrderDto) {
        return this.flashSaleService.createOrder(req.user.id, dto);
    }
}
