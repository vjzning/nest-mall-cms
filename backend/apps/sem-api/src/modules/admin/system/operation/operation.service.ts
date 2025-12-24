import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseTableListParams } from 'apps/sem-api/src/common/dto/index';
import { OperationLogEntity } from 'apps/sem-api/src/entity/operation.log.entity';
import { Between, LessThan, LessThanOrEqual, Repository } from 'typeorm';
import { CreateOpLogDto } from './dto';
import * as moment from 'moment';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class OperationService {
  constructor(
    @InjectRepository(OperationLogEntity)
    private readonly opRepository: Repository<OperationLogEntity>
  ) {}
  async addLog(dto: OperationLogEntity) {
    const entity = this.opRepository.create(dto);
    return this.opRepository.save(entity);
  }
  async getList(dto: BaseTableListParams) {
    const where = {};
    if (dto.create_at) {
      where['create_at'] = Between(dto.create_at[0], dto.create_at[1]);
    }
    const [list, count] = await this.opRepository
      .createQueryBuilder('op')
      .leftJoinAndSelect('op.user', 'user')
      .where(where)
      .take(dto.pageSize)
      .skip((dto.current - 1) * dto.pageSize)
      .orderBy('op.id', 'DESC')
      .getManyAndCount();
    return {
      list,
      count,
      page: dto.current,
      pageSize: dto.pageSize,
    };
  }
  //每天5点删除日志
  @Cron('0 0 5 * * *')
  async deleteLog() {
    //删除90天前的日志
    const date = moment().subtract(90, 'days').format('YYYY-MM-DD');
    await this.opRepository.delete({ create_at: LessThan(date) });
  }
}
