import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleEntity } from '@app/db/entities/article.entity';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private articleRepository: Repository<ArticleEntity>
    ) {}

    async findAll(query: any): Promise<[ArticleEntity[], number]> {
        const { page = 1, limit = 10, categoryId, tagId } = query;
        const qb = this.articleRepository
            .createQueryBuilder('article')
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

    async findOne(slug: string): Promise<ArticleEntity | null> {
        const qb = this.articleRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.category', 'category')
            .leftJoinAndSelect('article.tags', 'tags')
            .leftJoinAndSelect('article.author', 'author');

        if (/^\d+$/.test(slug)) {
            qb.where('article.id = :id', { id: +slug });
        } else {
            qb.where('article.slug = :slug', { slug });
        }

        const article = await qb.getOne();

        if (article) {
            // Increment views
            await this.articleRepository.increment(
                { id: article.id },
                'views',
                1
            );
        }

        return article;
    }
}
