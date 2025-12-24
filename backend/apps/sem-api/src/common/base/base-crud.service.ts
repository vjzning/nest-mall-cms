import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Base CRUD Service - 替代 TypeOrmCrudService
 */
export class BaseCrudService<T> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(query: PaginationQuery = {}): Promise<PaginatedResponse<T>> {
    const {
      page = 1,
      limit = 10,
      sort = 'id',
      order = 'DESC',
      ...filters
    } = query;

    // 只保留有效的过滤条件
    const where: any = {};
    if (typeof filters == 'string') {
      try {
        const newQuery = JSON.parse(filters);
        Object.keys(newQuery).forEach((key) => {
          if (
            newQuery[key] !== undefined &&
            newQuery[key] !== null &&
            newQuery[key] !== ''
          ) {
            where[key] = newQuery[key];
          }
        });
      } catch (error) {
      }
    } else {
      Object.keys(filters).forEach((key) => {
        if (
          filters[key] !== undefined &&
          filters[key] !== null &&
          filters[key] !== ''
        ) {
          where[key] = filters[key];
        }
      });
    }

    const findOptions: FindManyOptions<T> = {
      where: Object.keys(where).length > 0 ? where : undefined,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      order: { [sort]: order } as any,
    };

    console.log(findOptions);
    try {
    const [data, total] = await this.repository.findAndCount(findOptions);

    }catch(e){

    }

    return {
      data: [],
      total: 0,
      page: Number(page),
      pageSize: Number(limit),
    };
  }

  async findOne(id: number | string, relations?: string[]): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as any,
      relations,
    });
  }

  async create(dto: Partial<T>): Promise<T> {
    const entity = this.repository.create(dto as any);
    const saved = await this.repository.save(entity);
    // save 可能返回 T 或 T[]，确保返回单个实体
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async update(id: number | string, dto: Partial<T>): Promise<T | null> {
    await this.repository.update(id as any, dto as any);
    return this.findOne(id);
  }

  async delete(id: number | string): Promise<void> {
    await this.repository.delete(id as any);
  }

  async softDelete(id: number | string): Promise<void> {
    await this.repository.update(id as any, { isDel: true } as any);
  }

  // 直接暴露 repository 供特殊查询使用
  get repo(): Repository<T> {
    return this.repository;
  }
}
