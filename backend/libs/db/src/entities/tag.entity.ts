import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ArticleEntity } from './article.entity';

@Entity('cms_tag')
export class TagEntity extends BaseEntity {
  @Column({ length: 50, unique: true })
  name: string;

  @ManyToMany(() => ArticleEntity, (article) => article.tags)
  articles: ArticleEntity[];
}
