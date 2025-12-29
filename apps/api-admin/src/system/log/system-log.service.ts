import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { SystemLogEntity } from '@app/db';

@Injectable()
export class SystemLogService {
  constructor(
    @InjectRepository(SystemLogEntity)
    private readonly logRepository: Repository<SystemLogEntity>,
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    username?: string;
    module?: string;
    status?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, limit = 10, username, module, status, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (username) where.username = Like(`%${username}%`);
    if (module) where.module = Like(`%${module}%`);
    if (status !== undefined) where.status = status;
    
    // TODO: Handle date range filtering if needed
    // if (startDate && endDate) {
    //   where.createdAt = Between(new Date(startDate), new Date(endDate));
    // }

    const [items, total] = await this.logRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    return this.logRepository.findOneBy({ id });
  }

  async removeOldLogs(days: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    // TypeORM delete can take criteria
    return this.logRepository.createQueryBuilder()
      .delete()
      .where('createdAt < :date', { date })
      .execute();
  }
}
