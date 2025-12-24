import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleEntity } from '@app/db/entities/article.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private articleRepository: Repository<ArticleEntity>,
  ) {}

  async findAll(query: any): Promise<[ArticleEntity[], number]> {
    const { page = 1, limit = 10, categoryId, tagId } = query;
    const qb = this.articleRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.tags', 'tags')
      .where('article.status = :status', { status: 2 }) // Only Published
      .andWhere('article.publishedAt <= :now', { now: new Date() })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('article.isTop', 'DESC')
      .addOrderBy('article.publishedAt', 'DESC');

    if (categoryId) {
      qb.andWhere('article.category_id = :categoryId', { categoryId });
    }

    if (tagId) {
      qb.andWhere('tags.id = :tagId', { tagId });
    }

    return qb.getManyAndCount();
  }

  async findOne(id: number): Promise<ArticleEntity | null> {
    const article = await this.articleRepository.findOne({
      where: { id, status: 2 },
      relations: ['category', 'tags', 'author'],
    });

    if (article) {
      // Increment views
      await this.articleRepository.increment({ id }, 'views', 1);
    }

    return article;
  }
}
