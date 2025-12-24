import { Entity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BaseEntity } from './base.entity';
import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';

@Entity('mall_member')
export class MemberEntity extends BaseEntity {
  @Column({ length: 50, unique: true, nullable: true })
  username: string;

  @Exclude()
  @Column({ length: 100, nullable: true })
  password: string;

  @Column({ length: 50, nullable: true })
  nickname: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({ length: 100, nullable: true, unique: true })
  email: string;

  @Column({ length: 20, nullable: true, unique: true })
  phone: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 1: Active, 0: Disabled

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2a$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
