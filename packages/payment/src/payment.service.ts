import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfigEntity } from '@app/db/entities/system-config.entity';
import { PaymentStrategy, PaymentStatus } from './interfaces/payment-strategy.interface';
import { AlipayStrategy } from './strategies/alipay.strategy';
import { WechatPayStrategy } from './strategies/wechat-pay.strategy';
import { MallOrderEntity, OrderStatus } from '@app/db/entities/mall-order.entity';
import { PaymentMethod } from '@app/db/entities/mall-payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(SystemConfigEntity)
    private readonly configRepo: Repository<SystemConfigEntity>,
  ) {}

  private async getStrategy(method: string): Promise<PaymentStrategy> {
    // Load config from DB
    const configs = await this.configRepo.find({
      where: { group: 'payment' },
    });
    
    // Convert list to object map
    const configMap = configs.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    switch (method) {
      case PaymentMethod.ALIPAY:
        return new AlipayStrategy(configMap);
      case PaymentMethod.WECHAT:
        return new WechatPayStrategy(configMap);
      default:
        throw new BadRequestException(`Unsupported payment method: ${method}`);
    }
  }

  async pay(order: MallOrderEntity, method: string) {
    if (order.status !== OrderStatus.PENDING_PAY) {
      throw new BadRequestException('Order status is not pending pay');
    }
    const strategy = await this.getStrategy(method);
    return strategy.pay(order);
  }

  async query(orderNo: string, method: string) {
    const strategy = await this.getStrategy(method);
    return strategy.query(orderNo);
  }

  async verifyCallback(method: string, data: any) {
    const strategy = await this.getStrategy(method);
    return strategy.verifyCallback(data);
  }
}
