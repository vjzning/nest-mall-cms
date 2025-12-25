import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderDeliveryDto } from './dto/order-delivery.dto';
import { QueryOrderDto } from './dto/query-order.dto';

@Controller('mall/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get()
  findAll(@Query() query: QueryOrderDto) {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Post(':id/delivery')
  ship(@Param('id') id: string, @Body() data: OrderDeliveryDto) {
    return this.orderService.ship(+id, data);
  }
}
