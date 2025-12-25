import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum PaymentMethod {
  ALIPAY = 'alipay',
  WECHAT = 'wechat',
  BALANCE = 'balance',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('mall_payment')
export class MallPaymentEntity extends BaseEntity {
  @Column({ name: 'order_no', length: 50 })
  orderNo: string;

  @Column({ name: 'transaction_id', length: 100, nullable: true })
  transactionId: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 20 })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 20, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: 'paid_at', type: 'datetime', nullable: true })
  paidAt: Date;
}
