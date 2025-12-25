import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import type { MallOrderEntity } from './mall-order.entity';

@Entity('mall_delivery')
export class MallDeliveryEntity extends BaseEntity {
  @Column({ name: 'order_id', type: 'bigint' })
  orderId: number;

  @ManyToOne('MallOrderEntity', (order: MallOrderEntity) => order.deliveries)
  @JoinColumn({ name: 'order_id' })
  order: MallOrderEntity;

  @Column({ name: 'delivery_sn', length: 64, comment: 'Logistics/Tracking Number' })
  deliverySn: string;

  @Column({ name: 'delivery_company', length: 64, comment: 'Logistics Company Name' })
  deliveryCompany: string;

  @Column({ type: 'json', comment: 'Snapshot of items in this delivery: [{ skuId, quantity, name }]' })
  items: Array<{ skuId: number; quantity: number; productName: string }>;

  @Column({ name: 'remark', length: 255, nullable: true })
  remark: string;
}
