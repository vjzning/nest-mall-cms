import { Injectable, Logger } from '@nestjs/common';
import { PaymentStrategy, PaymentStatus, PaymentOptions, CallbackResult } from '../interfaces/payment-strategy.interface';
import { MallOrderEntity } from '@app/db/entities/mall-order.entity';

@Injectable()
export class AlipayStrategy implements PaymentStrategy {
  private readonly logger = new Logger(AlipayStrategy.name);

  constructor(private readonly config: any) {
    // Config would be injected from PaymentService
  }

  async pay(order: MallOrderEntity, options?: PaymentOptions): Promise<any> {
    this.logger.log(`Initiating Alipay for order ${order.orderNo}`);
    // TODO: Implement Alipay SDK call
    return {
      method: 'alipay',
      orderNo: order.orderNo,
      amount: order.payAmount,
      url: 'https://alipay.com/pay?xxx', // Mock
    };
  }

  async handleCallback(data: any, headers?: any): Promise<CallbackResult> {
    this.logger.log('Handling Alipay callback');
    // TODO: Implement signature verification and data parsing
    return {
      success: true,
      orderNo: data.out_trade_no,
      transactionId: data.trade_no,
      amount: Number(data.total_amount),
      raw: data,
    };
  }

  async query(orderNo: string): Promise<PaymentStatus> {
    this.logger.log(`Querying Alipay status for ${orderNo}`);
    return PaymentStatus.SUCCESS; // Mock
  }

  async refund(transactionId: string, amount: number, reason: string): Promise<any> {
    this.logger.log(`Initiating Alipay refund for ${transactionId}`);
    return { success: true }; // Mock
  }
}
