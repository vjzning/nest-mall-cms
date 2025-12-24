import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ArticleEntity } from '@app/db/entities/article.entity';
import { TagEntity } from '@app/db/entities/tag.entity';
import { CategoryEntity } from '@app/db/entities/category.entity';
import { UserEntity } from '@app/db/entities/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private articleRepository: Repository<ArticleEntity>,
    @InjectRepository(TagEntity)
    private tagRepository: Repository<TagEntity>,
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(createArticleDto: CreateArticleDto, user: UserEntity): Promise<ArticleEntity> {
    const { tagIds, categoryId, ...articleData } = createArticleDto;

    const article = this.articleRepository.create({
      ...articleData,
      author: user,
      // Default to Draft (0) or Pending Review (1) based on business logic
      status: articleData.status || 0,
    } as ArticleEntity);

    if (categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (category) {
        article.category = category;
      }
    }

    if (tagIds && tagIds.length > 0) {
      const tags = await this.tagRepository.findBy({ id: In(tagIds) });
      article.tags = tags;
    }

    return this.articleRepository.save(article);
  }

  async findAll(query: any): Promise<[ArticleEntity[], number]> {
    const { page = 1, limit = 10, title, status } = query;
    const qb = this.articleRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.tags', 'tags')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('article.createdAt', 'DESC');

    if (title) {
      qb.andWhere('article.title LIKE :title', { title: `%${title}%` });
    }

    if (status !== undefined) {
      qb.andWhere('article.status = :status', { status });
    }

    return qb.getManyAndCount();
  }

  async findOne(id: number): Promise<ArticleEntity | null> {
    return this.articleRepository.findOne({
      where: { id },
      relations: ['category', 'tags', 'author'],
    });
  }

  async update(id: number, updateArticleDto: UpdateArticleDto): Promise<ArticleEntity | null> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article #${id} not found`);
    }

    const { tagIds, categoryId, ...articleData } = updateArticleDto;

    Object.assign(article, articleData);

    if (categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (category) {
        article.category = category;
      }
    }

    if (tagIds) {
      const tags = await this.tagRepository.findBy({ id: In(tagIds) });
      article.tags = tags;
    }

    return this.articleRepository.save(article);
  }

  async audit(id: number, status: number): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article #${id} not found`);
    }

    // 0: Draft, 1: Pending, 2: Published, 3: Rejected, 4: Offline
    if (![2, 3].includes(status)) {
      throw new BadRequestException('Invalid audit status. Allowed: 2 (Published), 3 (Rejected)');
    }

    article.status = status;
    if (status === 2) {
      article.publishedAt = new Date();
    }

    return this.articleRepository.save(article);
  }

  async remove(id: number): Promise<void> {
    await this.articleRepository.delete(id);
  }
}
