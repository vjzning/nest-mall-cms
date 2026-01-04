import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MallProductSkuEntity } from './mall-product-sku.entity';
import { type MallCategoryEntity } from './mall-category.entity';

@Entity('mall_product')
export class MallProductEntity extends BaseEntity {
  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'category_id', type: 'bigint', nullable: true, comment: '分类ID' })
  categoryId: number;

  @ManyToOne('MallCategoryEntity', (category: MallCategoryEntity) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: MallCategoryEntity;

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

  @Column({ name: 'shipping_template_id', type: 'bigint', nullable: true, comment: '运费模板 ID' })
  shippingTemplateId: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0, comment: '重量 (kg)' })
  weight: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0, comment: '体积 (m³)' })
  volume: number;

  @Column({ length: 50, nullable: true, comment: '价格区间或起步价缓存' })
  price: string;

  @OneToMany(() => MallProductSkuEntity, sku => sku.product)
  skus: MallProductSkuEntity[];
}
