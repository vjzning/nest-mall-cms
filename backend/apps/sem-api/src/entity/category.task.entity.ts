import { Column, Entity, RelationId, Tree, TreeChildren, TreeParent, type Relation } from 'typeorm';
import { Base } from './base';
@Entity('category_task')
@Tree('materialized-path')
export class CategoryTaskEntity extends Base {
  @Column({
    type: 'varchar',
    nullable: true,
    length: 32,
    name: 'name',
    comment: '分类名称',
  })
  name: string;

  @TreeChildren()
  children?: Relation<CategoryTaskEntity>[];

  @TreeParent()
  parent?: Relation<CategoryTaskEntity>;

  @RelationId((a: CategoryTaskEntity) => a.parent)
  pid: number;
}
