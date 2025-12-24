import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ArticleEntity } from './article.entity';
import type { ArticleEntity as ArticleEntityType } from './article.entity';

@Entity('cms_category')
export class CategoryEntity extends BaseEntity {
  @Column({ length: 50 })
  name: string;

  @Column({ length: 50, unique: true })
  slug: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ type: 'bigint', nullable: true, default: 0 })
  parentId: number;

  @Column({ type: 'int', default: 0 })
  sort: number;

  @OneToMany(() => ArticleEntity, (article) => article.category)
  articles: ArticleEntityType[];
}
