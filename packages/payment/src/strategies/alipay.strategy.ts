import { Injectable, Logger } from '@nestjs/common';
import { PaymentStrategy, PaymentStatus } from '../interfaces/payment-strategy.interface';
import { MallOrderEntity } from '@app/db/entities/mall-order.entity';

@Injectable()
export class AlipayStrategy implements PaymentStrategy {
  private readonly logger = new Logger(AlipayStrategy.name);

  constructor(private readonly config: any) {
    // Config would be injected from PaymentService
  }

  async pay(order: MallOrderEntity): Promise<any> {
    this.logger.log(`Initiating Alipay for order ${order.orderNo}`);
    // TODO: Implement Alipay SDK call
    return {
      method: 'alipay',
      orderNo: order.orderNo,
      amount: order.payAmount,
      gatewayUrl: 'https://openapi.alipay.com/gateway.do?...', // Mock
    };
  }

  async verifyCallback(data: any): Promise<boolean> {
    this.logger.log('Verifying Alipay callback');
    // TODO: Implement signature verification
    return true;
  }

  async query(orderNo: string): Promise<PaymentStatus> {
    this.logger.log(`Querying Alipay status for ${orderNo}`);
    return PaymentStatus.SUCCESS; // Mock
  }
}
