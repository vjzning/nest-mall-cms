import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MallProductEntity } from './mall-product.entity';
import { MallProductSkuEntity } from './mall-product-sku.entity';
import { FlashSaleActivityEntity } from './flash-sale-activity.entity';

@Entity('flash_sale_products')
export class FlashSaleProductEntity extends BaseEntity {
    @Column({ type: 'bigint', comment: '活动ID' })
    @Index()
    activityId: number;

    @ManyToOne(() => FlashSaleActivityEntity)
    @JoinColumn({ name: 'activityId' })
    activity: FlashSaleActivityEntity;

    @Column({ type: 'bigint', comment: '商品ID' })
    productId: number;

    @ManyToOne(() => MallProductEntity)
    @JoinColumn({ name: 'productId' })
    product: MallProductEntity;

    @Column({ type: 'bigint', comment: 'SKU ID' })
    skuId: number;

    @ManyToOne(() => MallProductSkuEntity)
    @JoinColumn({ name: 'skuId' })
    sku: MallProductSkuEntity;

    @Column({ type: 'decimal', precision: 10, scale: 2, comment: '秒杀价格' })
    flashPrice: number;

    @Column({ type: 'int', comment: '秒杀库存' })
    stock: number;

    @Column({ type: 'int', default: 0, comment: '已售数量' })
    sales: number;

    @Column({ type: 'int', default: 1, comment: '每人限购数量' })
    limitPerUser: number;

    @Column({ type: 'int', default: 0, comment: '排序' })
    sort: number;
}
