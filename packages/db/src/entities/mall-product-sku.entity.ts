import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import type { MallProductEntity } from './mall-product.entity';

@Entity('mall_product_sku')
export class MallProductSkuEntity extends BaseEntity {
    @Column({ name: 'product_id', type: 'bigint' })
    productId: number;

    @ManyToOne(
        'MallProductEntity',
        (product: MallProductEntity) => product.skus
    )
    @JoinColumn({ name: 'product_id' })
    product: MallProductEntity;

    @Column({ length: 100, unique: true })
    code: string;

    @Column({ type: 'json', nullable: true })
    specs: any; // e.g. [{"key": "Color", "value": "Red"}]

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({
        name: 'market_price',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    })
    marketPrice: number;

    @Column({ type: 'int', default: 0, unsigned: true })
    stock: number;
}
