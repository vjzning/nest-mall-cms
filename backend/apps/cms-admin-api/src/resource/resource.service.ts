import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ResourceEntity } from '@app/db/entities/resource.entity';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(ResourceEntity)
    private resourceRepository: Repository<ResourceEntity>,
  ) {}

  async findAll(page: number = 1, limit: number = 20, filename?: string) {
    const skip = (page - 1) * limit;
    const where = filename ? { originalName: Like(`%${filename}%`) } : {};

    const [items, total] = await this.resourceRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['uploader'],
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
