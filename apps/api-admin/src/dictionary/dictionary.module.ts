import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictionaryService } from './dictionary.service';
import { DictionaryController } from './dictionary.controller';
import { DictTypeEntity } from '@app/db/entities/dict-type.entity';
import { DictDataEntity } from '@app/db/entities/dict-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DictTypeEntity, DictDataEntity])],
  controllers: [DictionaryController],
  providers: [DictionaryService],
})
export class DictionaryModule {}
