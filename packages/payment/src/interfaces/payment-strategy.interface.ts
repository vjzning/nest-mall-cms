import { MallOrderEntity } from '@app/db/entities/mall-order.entity';

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export interface PaymentOptions {
    openid?: string;
    clientIp?: string;
    tradeType?: string;
    [key: string]: any;
}

export interface CallbackResult {
    success: boolean;
    orderNo?: string;
    transactionId?: string;
    amount?: number;
    raw?: any;
}

export interface PaymentStrategy {
    /**
     * Initiate payment
     * @param order Order entity
     * @param options Payment options (e.g. openid, clientIp)
     * @returns Payment parameters for frontend (e.g. form html, or json params)
     */
    pay(order: MallOrderEntity, options?: PaymentOptions): Promise<any>;

    /**
     * Verify and parse callback data
     * @param data Raw body or parsed body
     * @param headers Request headers (required for some providers like WeChat)
     */
    handleCallback(data: any, headers?: any): Promise<CallbackResult>;

    /**
     * Query payment status from provider
     * @param orderNo
     */
    query(orderNo: string): Promise<PaymentStatus>;

    /**
     * Execute refund
     * @param transactionId
     * @param amount
     * @param reason
     */
    refund(transactionId: string, amount: number, reason: string): Promise<any>;
}
