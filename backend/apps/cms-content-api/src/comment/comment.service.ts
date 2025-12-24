import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from '@app/db/entities/comment.entity';
import { ArticleEntity } from '@app/db/entities/article.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(ArticleEntity)
    private articleRepository: Repository<ArticleEntity>,
  ) {}

  async findByArticle(articleId: number, query: any): Promise<[CommentEntity[], number]> {
    const { page = 1, limit = 10 } = query;
    return this.commentRepository.findAndCount({
      where: {
        article: { id: articleId },
        status: 1, // Only Approved
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async create(createCommentDto: any): Promise<CommentEntity> {
    const { articleId, ...commentData } = createCommentDto;
    const article = await this.articleRepository.findOne({ where: { id: articleId } });
    if (!article) {
      throw new NotFoundException(`Article #${articleId} not found`);
    }

    const comment = this.commentRepository.create({
      ...commentData,
      article,
      status: 0, // Default to Pending
    });

    return this.commentRepository.save(comment as unknown as CommentEntity);
  }
}
