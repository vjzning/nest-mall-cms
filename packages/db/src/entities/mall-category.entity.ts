import { Entity, Column, OneToMany, ManyToOne, JoinColumn, Tree, TreeChildren, TreeParent } from 'typeorm';
import { BaseEntity } from './base.entity';
import { type MallProductEntity } from './mall-product.entity';

@Entity('mall_category')
@Tree("materialized-path")
export class MallCategoryEntity extends BaseEntity {
  @Column({ length: 100, comment: '分类名称' })
  name: string;

  @Column({ length: 255, nullable: true, comment: '分类图标' })
  icon: string;

  @Column({ length: 255, nullable: true, comment: '分类大图/Banner' })
  pic: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态 1:启用 0:禁用' })
  status: number;

  @Column({ type: 'tinyint', default: 0, comment: '是否推荐 1:是 0:否' })
  isRecommend: number;

  @Column({ type: 'int', default: 0, comment: '层级 0:顶级 1:二级 ...' })
  level: number;

  @TreeParent()
  parent: MallCategoryEntity;

  @TreeChildren()
  children: MallCategoryEntity[];

  // 这里的关联需要在 ProductEntity 里也加上对应的 @ManyToOne
  @OneToMany('MallProductEntity', (c: MallProductEntity) => c.category)
  products: MallProductEntity[];
}
