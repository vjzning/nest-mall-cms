import { Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { PostEntity } from '../post/post.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { nullable: true, comment: '用户名称' })
  name: string;

  @Column('varchar', { nullable: true, comment: '用户昵称' })
  nickname: string;

  @Column('varchar', { nullable: true, comment: '用户头像' })
  avatar: string;

  @Column('int', { nullable: true, comment: '用户状态', default: 1 })
  status: number;

  @Column('timestamp', { nullable: true, comment: '创建时间' })
  created_at: Date;
  @Column('timestamp', { nullable: true, comment: '更新时间' })
  createdAt: Date;

  @Column('timestamp', { nullable: true, comment: '更新时间' })
  updatedAt: Date;

  // Post relationship
  @OneToMany(() => PostEntity, post => post.user)
  posts: Relation<PostEntity[]>;
}
