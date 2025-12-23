import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  type Relation,
} from 'typeorm';
import { UserStatus } from '../common/enum';
import { Base } from './base';
import type { RoleEntity } from './role.entity';
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { SALT } from '../common/constants/const';

@Entity('user')
export class UserEntity extends Base {
  @Column('varchar', { name: 'nickname', comment: '用户昵称', default: null })
  nickname: string;

  @Column('varchar', { unique: true, name: 'username', comment: '用户登录名' })
  username: string;

  @Exclude()
  @Column('varchar', { length: 128, comment: '密码', select: false })
  password: string;

  @Column('varchar', { length: 32, comment: '手机号码', default: null })
  mobile: string;

  @Column('varchar', { length: 32, comment: '邮箱', default: null })
  email: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.Normal,
    comment: '状态,0表示禁止,1表示正常',
  })
  status: UserStatus;

  @Column({
    type: 'tinyint',
    nullable: false,
    default: () => 0,
    name: 'is_super',
    comment: '是否为超级管理员1表示是,0表示不是',
  })
  is_super: number;

  @ManyToMany('RoleEntity', (role: RoleEntity) => role.users)
  @JoinTable({
    name: 'user_role',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Relation<RoleEntity>[];
  @BeforeInsert()
  @BeforeUpdate()
  makePassword() {
    // console.log('makePassword', this.password);
    if (this.password) {
      const salt = bcrypt.genSaltSync(SALT);
      const hash = bcrypt.hashSync(this.password, salt);
      this.password = hash;
    }
  }
}
