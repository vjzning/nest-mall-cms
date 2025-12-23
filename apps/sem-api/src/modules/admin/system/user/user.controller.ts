import { Body, Controller, Delete, Get, Injectable, Param, Post, Query } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { BusinessBaseUserEntity } from 'apps/sem-api/src/entity/business.user.entity';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'apps/sem-api/src/common/base/base-crud.service';
import { BusinessUserListQueryDto, SaveBusinessUserDto } from './dto';

@Injectable()
export class BusinessUserService extends BaseCrudService<BusinessBaseUserEntity> {
  constructor(@InjectRepository(BusinessBaseUserEntity) repo: Repository<BusinessBaseUserEntity>) {
    super(repo);
  }
}

@Controller('/business/user')
export class BusinessUserController {
  constructor(public service: BusinessUserService) { }

  @Get()

  async getMany(@Query() query: BusinessUserListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')


  async getOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Post()

  async createOne(@Body() dto: SaveBusinessUserDto) {
    return this.service.create(dto);
  }

  @Delete(':id')


  async deleteOne(@Param('id') id: string) {
    await this.service.softDelete(Number(id));
    return { success: true };
  }
}
