import {
  Column,
  Entity,
  ManyToMany,
  RelationId,
  Tree,
  TreeChildren,
  TreeParent,
  type Relation,
} from 'typeorm';
import { AccessType } from '../common/enum';
import { Base } from './base';
import { RoleEntity } from './role.entity';
@Entity('access')
@Tree('materialized-path')
export class AccessEntity extends Base {
  @Column({
    type: 'varchar',
    nullable: true,
    length: 50,
    name: 'name',
    comment: '名称',
  })
  name: string;

  @Column({
    type: 'enum',
    enum: AccessType,
    name: 'type',
    comment: '类型,1:表示模块,2:表示菜单,3:表示接口(API)',
  })
  type: AccessType;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 100,
    name: 'icon',
    comment: '小图标',
  })
  icon: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 100,
    name: 'path',
    comment: 'url地址',
  })
  path: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 10,
    name: 'method',
    comment: '请求方式',
  })
  method: string;

  @TreeChildren()
  children: AccessEntity[];

  @TreeParent()
  parent: AccessEntity;

  @RelationId((a: AccessEntity) => a.parent)
  pid: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 1,
    name: 'sort',
    comment: '排序',
  })
  sort: number;

  @Column({
    type: 'tinyint',
    nullable: true,
    default: 1,
    name: 'status',
    comment: '状态,0表示禁止,1表示正常',
  })
  status: number;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 100,
    name: 'description',
    comment: '描述',
  })
  description: string;

  @ManyToMany(() => RoleEntity, (roles: RoleEntity) => roles.access, {
    createForeignKeyConstraints: false,
  })
  roles: Relation<RoleEntity>[];
}
