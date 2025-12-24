import { Column, Entity, RelationId, Tree, TreeChildren, TreeParent, type Relation } from 'typeorm';
import { Base } from './base';
@Entity('category_award')
@Tree('materialized-path')
export class CategoryAwardEntity extends Base {
  @Column({
    type: 'varchar',
    nullable: true,
    length: 32,
    name: 'name',
    comment: '分类名称',
  })
  name: string;

  @TreeChildren()
  children: Relation<CategoryAwardEntity>[];

  @TreeParent()
  parent: Relation<CategoryAwardEntity>;

  @RelationId((a: CategoryAwardEntity) => a.parent)
  pid: number;
}
