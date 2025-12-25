import { MallOrderEntity } from '@app/db/entities/mall-order.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface PaymentStrategy {
  /**
   * Initiate payment
   * @param order Order entity
   * @returns Payment parameters for frontend (e.g. form html, or json params)
   */
  pay(order: MallOrderEntity): Promise<any>;

  /**
   * Handle payment callback
   * @param data Callback data from payment provider
   * @returns boolean indicating if signature is valid
   */
  verifyCallback(data: any): Promise<boolean>;

  /**
   * Query payment status
   * @param orderNo Order number
   */
  query(orderNo: string): Promise<PaymentStatus>;
}
