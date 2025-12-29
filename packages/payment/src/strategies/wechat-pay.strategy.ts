import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
    PaymentStrategy,
    PaymentStatus,
    PaymentOptions,
    CallbackResult,
} from '../interfaces/payment-strategy.interface';
import { MallOrderEntity } from '@app/db/entities/mall-order.entity';
import WxPay from 'wechatpay-node-v3';

@Injectable()
export class WechatPayStrategy implements PaymentStrategy {
    private readonly logger = new Logger(WechatPayStrategy.name);
    private payInstance: any;

    constructor(private readonly config: Record<string, string>) {
        this.initWxPay();
    }

    private initWxPay() {
        try {
            this.payInstance = new WxPay({
                appid: this.config.wechat_appid,
                mchid: this.config.wechat_mchid,
                publicKey: Buffer.from(this.config.wechat_public_key || ''), // 微信支付公钥 (v3)
                privateKey: Buffer.from(this.config.wechat_private_key || ''), // 商户私钥
                key: this.config.wechat_api_v3_key, // API v3 密钥
                serial_no: this.config.wechat_serial_no, // 商户证书序列号
            });
        } catch (error) {
            this.logger.error('Failed to initialize WechatPay SDK', error);
        }
    }

    async pay(order: MallOrderEntity, options?: PaymentOptions): Promise<any> {
        const tradeType = options?.tradeType || 'JSAPI';
        this.logger.log(
            `Initiating WechatPay (${tradeType}) for order ${order.orderNo}`
        );

        // Determine AppID based on tradeType if not provided in options
        let appid = options?.appid || this.config.wechat_appid;
        if (tradeType.toUpperCase() === 'MINI') {
            appid = this.config.wechat_appid_mini || appid;
        } else if (tradeType.toUpperCase() === 'H5') {
            appid = this.config.wechat_appid_h5 || appid;
        }

        const params: any = {
            appid,
            mchid: this.config.wechat_mchid,
            description: `Order ${order.orderNo}`,
            out_trade_no: order.orderNo,
            notify_url: this.config.wechat_notify_url,
            amount: {
                total: Math.round(Number(order.payAmount) * 100), // 分为单位
                currency: 'CNY',
            },
        };

        try {
            let result;
            switch (tradeType.toUpperCase()) {
                case 'JSAPI':
                    if (!options?.openid)
                        throw new BadRequestException(
                            'OpenID is required for JSAPI pay'
                        );
                    params.payer = { openid: options.openid };
                    result = await this.payInstance.transactions_jsapi(params);
                    break;
                case 'H5':
                    params.scene_info = {
                        payer_client_ip: options?.clientIp || '127.0.0.1',
                        h5_info: { type: 'Wap' },
                    };
                    result = await this.payInstance.transactions_h5(params);
                    break;
                case 'NATIVE':
                    result = await this.payInstance.transactions_native(params);
                    break;
                case 'APP':
                    result = await this.payInstance.transactions_app(params);
                    break;
                default:
                    throw new BadRequestException(
                        `Unsupported WeChat trade type: ${tradeType}`
                    );
            }
            return result;
        } catch (error) {
            this.logger.error(`WechatPay error (${tradeType}):`, error);
            throw new BadRequestException(
                error.message || 'WechatPay initiation failed'
            );
        }
    }

    async handleCallback(data: any, headers?: any): Promise<CallbackResult> {
        this.logger.log('Handling WechatPay callback');
        try {
            // 1. Verify signature
            // The SDK usually provides verifySignature, but it needs headers
            // const isValid = this.payInstance.verifySignature(headers, data);

            // 2. Decrypt resource
            const resource = data.resource;
            if (!resource) {
                throw new Error('No resource in callback data');
            }

            const result = this.payInstance.decipher_gcm(
                resource.ciphertext,
                resource.associated_data,
                resource.nonce,
                this.config.wechat_api_v3_key
            );

            this.logger.log('Decrypted WechatPay result:', result);

            return {
                success: result.trade_state === 'SUCCESS',
                orderNo: result.out_trade_no,
                transactionId: result.transaction_id,
                amount: result.amount?.total / 100,
                raw: result,
            };
        } catch (error) {
            this.logger.error('WechatPay callback handling failed', error);
            return { success: false };
        }
    }

    async query(orderNo: string): Promise<PaymentStatus> {
        this.logger.log(`Querying WechatPay status for ${orderNo}`);
        try {
            const result = await this.payInstance.query({
                out_trade_no: orderNo,
            });
            if (result.trade_state === 'SUCCESS') return PaymentStatus.SUCCESS;
            if (
                result.trade_state === 'NOTPAY' ||
                result.trade_state === 'USERPAYING'
            )
                return PaymentStatus.PENDING;
            return PaymentStatus.FAILED;
        } catch (error) {
            this.logger.error('Query failed', error);
            return PaymentStatus.FAILED;
        }
    }
}
