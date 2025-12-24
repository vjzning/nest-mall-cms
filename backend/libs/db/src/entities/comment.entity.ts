import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ArticleEntity } from './article.entity';
import { UserEntity } from './user.entity';

@Entity('cms_comment')
export class CommentEntity extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({ length: 50, nullable: true })
  guestName: string;

  @Column({ length: 100, nullable: true })
  guestEmail: string;

  @Column({ type: 'tinyint', default: 0, comment: '0: Pending, 1: Approved, 2: Rejected' })
  status: number;

  @Column({ length: 50, nullable: true })
  ip: string;

  @Column({ length: 255, nullable: true })
  userAgent: string;

  @ManyToOne(() => ArticleEntity)
  @JoinColumn({ name: 'article_id' })
  article: ArticleEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
