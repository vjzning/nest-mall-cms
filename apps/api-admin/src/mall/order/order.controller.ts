import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderDeliveryDto } from './dto/order-delivery.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';
import { RequirePermissions } from '../../common/decorators/auth.decorator';

@Controller('mall/orders')
@UseInterceptors(LogInterceptor)
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get()
    @RequirePermissions('mall:order:list')
    findAll(@Query() query: QueryOrderDto) {
        return this.orderService.findAll(query);
    }

    @Get(':id')
    @RequirePermissions('mall:order:query')
    findOne(@Param('id') id: string) {
        return this.orderService.findOne(+id);
    }

    @Post(':id/delivery')
    @RequirePermissions('mall:order:delivery')
    @Log({ module: '订单管理', action: '发货' })
    ship(@Param('id') id: string, @Body() data: OrderDeliveryDto) {
        return this.orderService.ship(+id, data);
    }
}
