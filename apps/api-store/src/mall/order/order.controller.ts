import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    UseGuards,
    Req,
    Request,
    Query,
    Patch,
    UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { PaymentService } from '@app/payment';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { OrderStatus } from '@app/db/entities/mall-order.entity';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('mall/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
    constructor(
        private readonly orderService: OrderService,
        private readonly paymentService: PaymentService
    ) {}

    @Post()
    @Log({ module: '交易管理', action: '创建订单' })
    @UseInterceptors(LogInterceptor)
    async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
        const memberId = req.user.id;

        // 1. Create order
        const order = await this.orderService.create(createOrderDto, memberId);

        // 2. Initiate payment
        // Ensure payment method is valid in DTO
        const payParams = await this.paymentService.pay(
            order,
            createOrderDto.paymentMethod
        );

        return {
            order,
            payParams,
        };
    }

    @Get()
    async findMyOrders(
        @Request() req,
        @Query('status') status?: OrderStatus,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        const memberId = req.user.id;
        return this.orderService.findMyOrders(memberId, status, page, limit);
    }

    @Get(':id')
    async findOne(@Param('id') id: number, @Request() req) {
        const memberId = req.user.id;
        return this.orderService.findOne(id, memberId);
    }

    @Patch(':id/cancel')
    @Log({ module: '交易管理', action: '取消订单' })
    @UseInterceptors(LogInterceptor)
    async cancel(@Param('id') id: number, @Request() req) {
        const memberId = req.user.id;
        return this.orderService.cancel(id, Number(memberId));
    }

    @Patch(':id/confirm-receipt')
    @Log({ module: '交易管理', action: '确认收货' })
    @UseInterceptors(LogInterceptor)
    async confirmReceipt(@Param('id') id: number, @Request() req) {
        const memberId = req.user.id;
        return this.orderService.confirmReceipt(id, memberId);
    }
}
