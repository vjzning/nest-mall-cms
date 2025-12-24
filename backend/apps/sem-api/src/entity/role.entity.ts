import { Column, Entity, JoinTable, ManyToMany, type Relation } from 'typeorm';
import { AccessEntity } from './access.entity';
import { Base } from './base';
import type { UserEntity } from './user.entity';

@Entity('role')
export class RoleEntity extends Base {
  @Column('varchar', { comment: '角色名称' })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 100,
    name: 'description',
    comment: '角色描述',
  })
  description: string;

  @Column({
    type: 'tinyint',
    nullable: true,
    default: 1,
    name: 'status',
    comment: '状态1表示正常,0表示禁用',
  })
  status: number;

  @ManyToMany('UserEntity', (user: UserEntity) => user.roles)
  users: Relation<UserEntity>[];
  @ManyToMany(() => AccessEntity, (access: AccessEntity) => access.roles)
  @JoinTable({
    name: 'role_access',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'access_id',
      referencedColumnName: 'id',
    },
  })
  access: Relation<AccessEntity>[];
}
