import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { QueryId } from '../account/dto';
import { DarftService } from './activity.service';
import { CreateDraftDto } from './dto';
import { Public } from 'apps/sem-api/src/common/decorator/public';

@Controller('draft')
export class DraftController {
  constructor(private readonly actDarftService: DarftService) {}
  @Get('/act')
  @Public()
  getList() {
    return this.actDarftService.findList({});
  }
  @Post('/act')
  save(@Body() body: CreateDraftDto) {
    return this.actDarftService.save(body);
  }
  @Delete('/act')
  del(@Body() body: QueryId) {
    return this.actDarftService.del(body.id);
  }
}
