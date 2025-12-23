import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseTableListParams } from 'apps/sem-api/src/common/dto/index';
import { BusinessTargetEntity } from 'apps/sem-api/src/entity/business.arget.entity';
import { Like, Repository } from 'typeorm';
import { QueryId } from '../account/dto';
import { SaveBusTargetDto } from './dto';
class ResDto {
  label: string;
  value: number;
}
@Injectable()
export class BusTargetService {
  constructor(
    @InjectRepository(BusinessTargetEntity)
    private readonly bustargetRepository: Repository<BusinessTargetEntity>
  ) { }
  get repository() {
    return this.bustargetRepository;
  }
  async getOptions() {
    const result = await this.bustargetRepository.find({
      where: { isDel: false },
      cache: true,
      select: ['params', 'id', 'name', 'type'],
    });
    return result.map((i) => ({
      ...i,
      label: i.name,
      value: i.id,
    }));
  }
  async findOne(options) {
    if (typeof options !== 'object') {
      return this.bustargetRepository.findOne({ where: { id: options } });
    }
    return this.bustargetRepository.findOne(options);
  }
  async remove(id) {
    const entity = await this.findOne(id);
    entity.isDel = true;
    return await this.bustargetRepository.save(entity);
  }
  async save(dto: SaveBusTargetDto) {
    const entity: BusinessTargetEntity = this.bustargetRepository.create(dto);
    return this.bustargetRepository.save(entity);
  }
  async update(dto: BusinessTargetEntity) {
    return this.bustargetRepository.update(dto.id, dto);
  }
  async delete(dto: QueryId) {
    return this.bustargetRepository.delete(dto.id);
  }
  async getList(dto: BaseTableListParams) {
    const where = { isDel: false };
    if (dto.name) {
      where['name'] = Like(`%${dto.name}%`);
    }
    if (dto['type'] != '0') {
      where['type'] = dto['type'];
    }
    if (dto.status != undefined) {
      where['status'] = dto.status;
    }
    const keyword = dto?.keyword;
    const qb = this.bustargetRepository
      .createQueryBuilder('bus')
      .skip((dto.current - 1) * dto.pageSize)
      .take(dto.pageSize)
      .where(where)
      .orderBy('bus.id', 'DESC');
    if (keyword) {
      qb.andWhere(
        `(bus.period = :period or bus.id = :id or bus.name like :name or bus.description like :desc)`,
        {
          id: keyword,
          name: `%${keyword}%`,
          desc: `%${keyword}%`,
          period: keyword,
        }
      );
    }
    const [list, count] = await qb.getManyAndCount();
    return {
      list,
      count,
      page: dto.current,
      pageSize: dto.pageSize,
    };
  }
}
