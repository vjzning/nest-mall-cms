import { Entity, Column, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { CategoryEntity } from './category.entity';
import type { CategoryEntity as CategoryEntityType } from './category.entity';
import { TagEntity } from './tag.entity';

@Entity('cms_article')
export class ArticleEntity extends BaseEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column({ length: 255, nullable: true })
  cover: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'tinyint', default: 0, comment: '0: Draft, 1: Pending Review, 2: Published, 3: Rejected, 4: Offline' })
  status: number;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'tinyint', default: 0 })
  isTop: number;

  @Column({ type: 'tinyint', default: 0 })
  isRecommend: number;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @ManyToOne(() => CategoryEntity, (category) => category.articles)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntityType;

  @ManyToMany(() => TagEntity, (tag) => tag.articles)
  @JoinTable({
    name: 'cms_article_tag',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: TagEntity[];
}
