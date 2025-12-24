import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from '@app/db/entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  async findAll(query: any): Promise<[CommentEntity[], number]> {
    const { page = 1, limit = 10, articleId, status } = query;
    const qb = this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.article', 'article')
      .leftJoinAndSelect('comment.user', 'user')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('comment.created_at', 'DESC');

    if (articleId) {
      qb.andWhere('comment.article_id = :articleId', { articleId });
    }

    if (status !== undefined) {
      qb.andWhere('comment.status = :status', { status });
    }

    return qb.getManyAndCount();
  }

  async audit(id: number, status: number): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment #${id} not found`);
    }

    // 0: Pending, 1: Approved, 2: Rejected
    if (![1, 2].includes(status)) {
      throw new BadRequestException('Invalid audit status. Allowed: 1 (Approved), 2 (Rejected)');
    }

    comment.status = status;
    return this.commentRepository.save(comment);
  }

  async remove(id: number): Promise<void> {
    await this.commentRepository.delete(id);
  }
}
