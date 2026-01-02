import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { CreateDictTypeDto, CreateDictDataDto } from './dto/create-dict.dto';
import { UpdateDictTypeDto, UpdateDictDataDto } from './dto/update-dict.dto';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';
import { RequirePermissions } from '../common/decorators/auth.decorator';

@Controller('dictionary')
@UseInterceptors(LogInterceptor)
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  // Type Endpoints
  @Post('type')
  @RequirePermissions('system:dict:create')
  @Log({ module: '字典管理', action: '创建字典类型' })
  createType(@Body() dto: CreateDictTypeDto) {
    return this.dictionaryService.createType(dto);
  }

  @Get('type')
  @RequirePermissions('system:dict:list')
  findAllTypes() {
    return this.dictionaryService.findAllTypes();
  }

  @Get('type/:id')
  @RequirePermissions('system:dict:query')
  findOneType(@Param('id') id: string) {
    return this.dictionaryService.findOneType(+id);
  }

  @Patch('type/:id')
  @RequirePermissions('system:dict:update')
  @Log({ module: '字典管理', action: '修改字典类型' })
  updateType(@Param('id') id: string, @Body() dto: UpdateDictTypeDto) {
    return this.dictionaryService.updateType(+id, dto);
  }

  @Delete('type/:id')
  @RequirePermissions('system:dict:delete')
  @Log({ module: '字典管理', action: '删除字典类型' })
  removeType(@Param('id') id: string) {
    return this.dictionaryService.removeType(+id);
  }

  // Data Endpoints
  @Post('data')
  @RequirePermissions('system:dict:create')
  @Log({ module: '字典管理', action: '创建字典数据' })
  createData(@Body() dto: CreateDictDataDto) {
    return this.dictionaryService.createData(dto);
  }

  @Get('data/type/:typeCode')
  @RequirePermissions('system:dict:list')
  getDataByType(@Param('typeCode') typeCode: string) {
    return this.dictionaryService.getDataByType(typeCode);
  }

  @Get('data/:id')
  @RequirePermissions('system:dict:query')
  findOneData(@Param('id') id: string) {
    return this.dictionaryService.findOneData(+id);
  }

  @Patch('data/:id')
  @RequirePermissions('system:dict:update')
  @Log({ module: '字典管理', action: '修改字典数据' })
  updateData(@Param('id') id: string, @Body() dto: UpdateDictDataDto) {
    return this.dictionaryService.updateData(+id, dto);
  }

  @Delete('data/:id')
  @RequirePermissions('system:dict:delete')
  @Log({ module: '字典管理', action: '删除字典数据' })
  removeData(@Param('id') id: string) {
    return this.dictionaryService.removeData(+id);
  }
}
