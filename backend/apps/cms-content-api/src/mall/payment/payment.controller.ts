import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import { PaymentService } from '@app/payment';

@Controller('mall/payment')
export class MallPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('callback/alipay')
  async alipayCallback(@Body() data: any) {
    const valid = await this.paymentService.verifyCallback('alipay', data);
    if (valid) {
      // Update order status
      return 'success';
    }
    return 'fail';
  }

  @Post('callback/wechat')
  async wechatCallback(@Body() data: any) {
    const valid = await this.paymentService.verifyCallback('wechat', data);
    if (valid) {
        // Update order status
      return { code: 'SUCCESS', message: 'OK' };
    }
    return { code: 'FAIL', message: 'Signature error' };
  }
}
