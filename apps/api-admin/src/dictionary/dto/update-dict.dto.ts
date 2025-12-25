import { PartialType } from '@nestjs/mapped-types';
import { CreateDictTypeDto, CreateDictDataDto } from './create-dict.dto';

export class UpdateDictTypeDto extends PartialType(CreateDictTypeDto) {}
export class UpdateDictDataDto extends PartialType(CreateDictDataDto) {}
