import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MemberEntity } from './member.entity';
import { MallProductEntity } from './mall-product.entity';

@Entity('member_favorite')
@Index(['memberId', 'productId'], { unique: true })
export class MemberFavoriteEntity extends BaseEntity {
  @Column({ name: 'member_id', type: 'bigint' })
  memberId: number;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;

  @Column({ name: 'product_id', type: 'bigint' })
  productId: number;

  @ManyToOne(() => MallProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: MallProductEntity;
}
