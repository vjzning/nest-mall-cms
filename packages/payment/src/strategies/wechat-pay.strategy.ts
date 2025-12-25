import { Injectable, Logger } from '@nestjs/common';
import { PaymentStrategy, PaymentStatus } from '../interfaces/payment-strategy.interface';
import { MallOrderEntity } from '@app/db/entities/mall-order.entity';

@Injectable()
export class WechatPayStrategy implements PaymentStrategy {
  private readonly logger = new Logger(WechatPayStrategy.name);

  constructor(private readonly config: any) {
    // Config would be injected from PaymentService
  }

  async pay(order: MallOrderEntity): Promise<any> {
    this.logger.log(`Initiating WechatPay for order ${order.orderNo}`);
    // TODO: Implement WechatPay SDK call
    return {
      method: 'wechat',
      orderNo: order.orderNo,
      amount: order.payAmount,
      prepayId: 'wx1234567890', // Mock
    };
  }

  async verifyCallback(data: any): Promise<boolean> {
    this.logger.log('Verifying WechatPay callback');
    // TODO: Implement signature verification
    return true;
  }

  async query(orderNo: string): Promise<PaymentStatus> {
    this.logger.log(`Querying WechatPay status for ${orderNo}`);
    return PaymentStatus.SUCCESS; // Mock
  }
}
