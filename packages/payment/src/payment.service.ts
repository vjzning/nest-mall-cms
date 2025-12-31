import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfigEntity } from '@app/db/entities/system-config.entity';
import { PaymentStrategy, PaymentStatus, PaymentOptions, CallbackResult } from './interfaces/payment-strategy.interface';
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

    // Handle wechat sub-methods if they are passed as wechat:h5, wechat:jsapi, etc.
    const [mainMethod] = method.split(':');

    switch (mainMethod.toLowerCase()) {
      case PaymentMethod.ALIPAY:
        return new AlipayStrategy(configMap);
      case PaymentMethod.WECHAT:
        return new WechatPayStrategy(configMap);
      default:
        throw new BadRequestException(`Unsupported payment method: ${method}`);
    }
  }

  async pay(order: MallOrderEntity, method: string, options?: PaymentOptions) {
    if (order.status !== OrderStatus.PENDING_PAY) {
      throw new BadRequestException('Order status is not pending pay');
    }

    // If method is wechat:h5, extract tradeType
    if (method.includes(':')) {
      const [main, sub] = method.split(':');
      options = { ...options, tradeType: sub.toUpperCase() };
      method = main;
    }

    const strategy = await this.getStrategy(method);
    return strategy.pay(order, options);
  }

  async handleCallback(method: string, data: any, headers?: any): Promise<CallbackResult> {
    const strategy = await this.getStrategy(method);
    return strategy.handleCallback(data, headers);
  }

  async queryStatus(method: string, orderNo: string): Promise<PaymentStatus> {
    const strategy = await this.getStrategy(method);
    return strategy.query(orderNo);
  }

  async refund(method: string, transactionId: string, amount: number, reason: string) {
    const strategy = await this.getStrategy(method);
    return strategy.refund(transactionId, amount, reason);
  }
}
