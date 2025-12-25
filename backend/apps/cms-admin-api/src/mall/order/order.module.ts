import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MallOrderEntity } from '@app/db/entities/mall-order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [TypeOrmModule.forFeature([MallOrderEntity])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
