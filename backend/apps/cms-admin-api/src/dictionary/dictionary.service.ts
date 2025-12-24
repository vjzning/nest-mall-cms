import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictTypeEntity } from '@app/db/entities/dict-type.entity';
import { DictDataEntity } from '@app/db/entities/dict-data.entity';
import { CreateDictTypeDto, CreateDictDataDto } from './dto/create-dict.dto';
import { UpdateDictTypeDto, UpdateDictDataDto } from './dto/update-dict.dto';

@Injectable()
export class DictionaryService {
  constructor(
    @InjectRepository(DictTypeEntity)
    private readonly dictTypeRepository: Repository<DictTypeEntity>,
    @InjectRepository(DictDataEntity)
    private readonly dictDataRepository: Repository<DictDataEntity>,
  ) {}

  // Type operations
  createType(dto: CreateDictTypeDto) {
    const entity = this.dictTypeRepository.create(dto);
    return this.dictTypeRepository.save(entity);
  }

  findAllTypes() {
    return this.dictTypeRepository.find({
      order: { id: 'ASC' },
    });
  }

  findOneType(id: number) {
    return this.dictTypeRepository.findOneBy({ id });
  }

  updateType(id: number, dto: UpdateDictTypeDto) {
    return this.dictTypeRepository.update(id, dto);
  }

  removeType(id: number) {
    // 实际业务中可能需要检查是否有关联数据，这里简化直接删除
    return this.dictTypeRepository.delete(id);
  }

  // Data operations
  createData(dto: CreateDictDataDto) {
    const entity = this.dictDataRepository.create(dto);
    return this.dictDataRepository.save(entity);
  }

  findAllData() {
    return this.dictDataRepository.find({
      order: { typeCode: 'ASC', sort: 'ASC' },
    });
  }

  getDataByType(typeCode: string) {
    return this.dictDataRepository.find({
      where: { typeCode, status: 1 },
      order: { sort: 'ASC' },
    });
  }

  findOneData(id: number) {
    return this.dictDataRepository.findOneBy({ id });
  }

  updateData(id: number, dto: UpdateDictDataDto) {
    return this.dictDataRepository.update(id, dto);
  }

  removeData(id: number) {
    return this.dictDataRepository.delete(id);
  }
}
