import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import type { MallOrderEntity } from './mall-order.entity';

@Entity('mall_order_item')
export class MallOrderItemEntity extends BaseEntity {
  @Column({ name: 'order_id', type: 'bigint' })
  orderId: number;

  @ManyToOne('MallOrderEntity', (order: MallOrderEntity) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: MallOrderEntity;

  @Column({ name: 'product_id', type: 'bigint' })
  productId: number;

  @Column({ name: 'sku_id', type: 'bigint' })
  skuId: number;

  @Column({ name: 'product_name', length: 200 })
  productName: string;

  @Column({ name: 'product_img', length: 255, nullable: true })
  productImg: string;

  @Column({ name: 'sku_specs', type: 'json', nullable: true })
  skuSpecs: any;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  quantity: number;
}
