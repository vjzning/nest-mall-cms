import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MallAfterSaleEntity } from './mall-after-sale.entity';
import { MallOrderItemEntity } from './mall-order-item.entity';

@Entity('mall_after_sale_item')
export class MallAfterSaleItemEntity extends BaseEntity {
  @Column({ name: 'after_sale_id', type: 'bigint' })
  afterSaleId: number;

  @ManyToOne(() => MallAfterSaleEntity, (afterSale) => afterSale.items)
  @JoinColumn({ name: 'after_sale_id' })
  afterSale: MallAfterSaleEntity;

  @Column({ name: 'order_item_id', type: 'bigint' })
  orderItemId: number;

  @ManyToOne(() => MallOrderItemEntity)
  @JoinColumn({ name: 'order_item_id' })
  orderItem: MallOrderItemEntity;

  @Column({ name: 'sku_id', type: 'bigint' })
  skuId: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
