import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('mall/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id/ship')
  ship(@Param('id') id: string, @Body() data: { trackingNo: string; carrier: string }) {
    return this.orderService.ship(+id, data);
  }
}
