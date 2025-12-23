import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SysConfigEntity } from 'apps/sem-api/src/entity/system.config.entity';
import { Repository } from 'typeorm';
import { SaveConfig } from './dto';

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(SysConfigEntity)
    private readonly sysconfigRepository: Repository<SysConfigEntity>
  ) { }
  async getSysConfig() {
    return this.sysconfigRepository.findOne({ where: {} });
  }
  async saveSysConfig(dto: SaveConfig) {
    const entity = this.sysconfigRepository.create(dto);
    const srcData = await this.getSysConfig();
    if (srcData) {
      entity.id = srcData.id;
    }
    return this.sysconfigRepository.save(entity);
  }
}
