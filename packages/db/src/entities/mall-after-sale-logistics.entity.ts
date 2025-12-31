import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MallAfterSaleEntity } from './mall-after-sale.entity';

export enum AfterSaleLogisticsType {
  USER_RETURN = 1,    // 用户寄回
  MERCHANT_RESEND = 2 // 商家补发
}

@Entity('mall_after_sale_logistics')
export class MallAfterSaleLogisticsEntity extends BaseEntity {
  @Column({ name: 'after_sale_id', type: 'bigint' })
  afterSaleId: number;

  @ManyToOne(() => MallAfterSaleEntity)
  @JoinColumn({ name: 'after_sale_id' })
  afterSale: MallAfterSaleEntity;

  @Column({ type: 'int', default: AfterSaleLogisticsType.USER_RETURN })
  type: AfterSaleLogisticsType;

  @Column({ name: 'tracking_no', length: 100 })
  trackingNo: string;

  @Column({ length: 100 })
  carrier: string;

  @Column({ name: 'sender_info', type: 'json', nullable: true })
  senderInfo: any;

  @Column({ name: 'receiver_info', type: 'json', nullable: true })
  receiverInfo: any;
}
