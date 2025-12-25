import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { CreateDictTypeDto, CreateDictDataDto } from './dto/create-dict.dto';
import { UpdateDictTypeDto, UpdateDictDataDto } from './dto/update-dict.dto';

@Controller('dictionary')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  // Type Endpoints
  @Post('type')
  createType(@Body() dto: CreateDictTypeDto) {
    return this.dictionaryService.createType(dto);
  }

  @Get('type')
  findAllTypes() {
    return this.dictionaryService.findAllTypes();
  }

  @Get('type/:id')
  findOneType(@Param('id') id: string) {
    return this.dictionaryService.findOneType(+id);
  }

  @Patch('type/:id')
  updateType(@Param('id') id: string, @Body() dto: UpdateDictTypeDto) {
    return this.dictionaryService.updateType(+id, dto);
  }

  @Delete('type/:id')
  removeType(@Param('id') id: string) {
    return this.dictionaryService.removeType(+id);
  }

  // Data Endpoints
  @Post('data')
  createData(@Body() dto: CreateDictDataDto) {
    return this.dictionaryService.createData(dto);
  }

  @Get('data/type/:typeCode')
  getDataByType(@Param('typeCode') typeCode: string) {
    return this.dictionaryService.getDataByType(typeCode);
  }

  @Get('data/:id')
  findOneData(@Param('id') id: string) {
    return this.dictionaryService.findOneData(+id);
  }

  @Patch('data/:id')
  updateData(@Param('id') id: string, @Body() dto: UpdateDictDataDto) {
    return this.dictionaryService.updateData(+id, dto);
  }

  @Delete('data/:id')
  removeData(@Param('id') id: string) {
    return this.dictionaryService.removeData(+id);
  }
}
