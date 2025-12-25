import { Controller, Post, Body, Get, Param, UseGuards, Req, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { PaymentService } from '@app/payment';
import { CreateOrderDto } from './dto/create-order.dto';
// import { JwtAuthGuard } from '../../auth/jwt-auth.guard'; // Assuming auth is there

@Controller('mall/orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    // Mock memberId if not available in req.user
    const memberId = req.user?.id || 1; 

    // 1. Create order
    const order = await this.orderService.create(createOrderDto, memberId);
    
    // 2. Initiate payment
    // Ensure payment method is valid in DTO
    const payParams = await this.paymentService.pay(order, createOrderDto.paymentMethod);
    
    return {
      order,
      payParams,
    };
  }

  @Get()
  async findMyOrders(@Request() req) {
    const memberId = req.user?.id || 1;
    return this.orderService.findMyOrders(memberId);
  }
}
