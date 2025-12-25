import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MallProductSkuEntity } from './mall-product-sku.entity';

@Entity('mall_product')
export class MallProductEntity extends BaseEntity {
  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'category_id', type: 'bigint', nullable: true })
  categoryId: number;

  @Column({ length: 255, nullable: true })
  cover: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ type: 'text', nullable: true })
  detail: string;

  @Column({ type: 'tinyint', default: 0 })
  status: number; // 0: Off shelf, 1: On shelf

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ type: 'int', default: 0 })
  sales: number;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @OneToMany(() => MallProductSkuEntity, sku => sku.product)
  skus: MallProductSkuEntity[];
}
