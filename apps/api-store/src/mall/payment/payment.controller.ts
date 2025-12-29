import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { PaymentService } from '@app/payment';
import { OrderService } from '../order/order.service';

@Controller('mall/payment')
export class MallPaymentController {
    private readonly logger = new Logger(MallPaymentController.name);

    constructor(
        private readonly paymentService: PaymentService,
        private readonly orderService: OrderService
    ) {}

    @Post('callback/alipay')
    async alipayCallback(@Body() data: any) {
        this.logger.log('Received Alipay callback');
        try {
            const result = await this.paymentService.handleCallback(
                'alipay',
                data
            );
            if (result.success && result.orderNo && result.transactionId) {
                await this.orderService.handlePaid(
                    result.orderNo,
                    result.transactionId,
                    result.amount || 0,
                    'alipay'
                );
                return 'success';
            }
        } catch (error) {
            this.logger.error('Alipay callback processing failed', error);
        }
        return 'fail';
    }

    @Post('callback/wechat')
    async wechatCallback(@Body() data: any, @Headers() headers: any) {
        this.logger.log('Received WechatPay callback');
        try {
            const result = await this.paymentService.handleCallback(
                'wechat',
                data,
                headers
            );
            if (result.success && result.orderNo && result.transactionId) {
                await this.orderService.handlePaid(
                    result.orderNo,
                    result.transactionId,
                    result.amount || 0,
                    'wechat'
                );
                return { code: 'SUCCESS', message: 'OK' };
            }
        } catch (error) {
            this.logger.error('WechatPay callback processing failed', error);
        }
        return { code: 'FAIL', message: 'Error' };
    }
}
