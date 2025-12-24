import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { OperationLogDecorator } from 'apps/sem-api/src/common/decorator/operation';
import { Public } from 'apps/sem-api/src/common/decorator/public';
import { User } from 'apps/sem-api/src/common/decorator/usesr.decorator';
import { BaseTableListParams } from 'apps/sem-api/src/common/dto/index';
import { TaskScheduleMode } from 'apps/sem-api/src/common/enum';
import { QueryId, UpdateStatus } from '../account/dto';
import { SaveCategoryDto } from '../task/dto';
import { AwardService } from './award.service';
import { Response } from 'express';
import {
  CheckAwardDto,
  CheckAwardInfoQueryDto,
  CreateAwardDto,
  ExportAwardExcelQueryDto,
  MappNameToIdDto,
  SendAwardDto,
} from './dto';
import { UserEntity } from 'apps/sem-api/src/entity/user.entity';
import { DataSource } from 'typeorm';
import { AwardEntity } from 'apps/sem-api/src/entity/award.entity';

@Controller('award')
export class AwardController {
  constructor(private readonly awardService: AwardService, private dataSource: DataSource) { }
  @Get('category/list')

  getCategory(@Query() dto: BaseTableListParams) {
    return this.awardService.getTaskCategory(dto);
  }
  @Post('category/add')

  @OperationLogDecorator(['奖励分类', '添加'])
  addCategory(@Body() body: SaveCategoryDto) {
    return this.awardService.saveCategory(body);
  }
  @Post('category/update')

  @OperationLogDecorator(['奖励分类', '更新'])
  updateCategory(@Body() body: SaveCategoryDto) {
    return this.awardService.saveCategory(body);
  }
  @Delete('category/delete')

  @OperationLogDecorator(['奖励分类', '删除'])
  deleteCategory(@Body() body: QueryId) {
    return this.awardService.deleteCategory(body);
  }

  @Post('/create')

  @OperationLogDecorator(['奖励', '添加'])
  createAward(@Body() body: CreateAwardDto) {
    return this.awardService.createAward(body);
  }

  @Get('/list')

  getAwardList(@Query() query: BaseTableListParams) {
    return this.awardService.getAwardList(query);
  }
  @Get('/options')
  @Public()
  async getSelectOptions() {
    return await this.dataSource
      .getRepository(AwardEntity)
      .createQueryBuilder('t')
      // .select('t.id', 'value')
      .select([
        'id',
        'id as value',
        'num_attr as numAttr',
        'image',
        'custom_param',
      ])
      .addSelect("CONCAT(t.name,'(', t.id, ')')", 'label')
      .orderBy('t.id', 'DESC')
      .getRawMany();
  }
  @Post('/status/update')
  @OperationLogDecorator(['奖励', '更新状态'])
  async updateStatus(@Body() body: UpdateStatus) {
    await this.awardService.updateStatus(body);
    return true;
  }
  @Delete('/delete')

  @OperationLogDecorator(['奖励', '删除'])
  async deleteAward(@Body() qs: QueryId) {
    return this.awardService.deleteAward(qs);
  }
  @Get('/check')

  async getCheckArard(@Query() qs: BaseTableListParams) {
    return this.awardService.getCheckAwardList2(qs);
  }
  @Get('/check/info')
  async getCheckInfo(@Query() qs: CheckAwardInfoQueryDto) {
    return this.awardService.getCheckAwardInfo(qs.id);
  }
  @Get('/check2')

  async getCheckArard2(@Query() qs: BaseTableListParams) {
    return this.awardService.getCheckAwardList2(qs);
  }

  @Post('/check')

  @OperationLogDecorator(['奖励', '审核'])
  async checkAward(@Body() body: CheckAwardDto, @User() user: UserEntity) {
    return this.awardService.checkAward(body, user);
  }
  @Post('/bulk/check')

  @OperationLogDecorator(['奖励', '批量审核'])
  async bulkCheckAward(@Body() body: CheckAwardDto, @User() user: UserEntity) {
    return this.awardService.bulkCheckAward(body, user);
  }
  @Post('/send')

  @OperationLogDecorator(['奖励', '发送'])
  async sendAward(@Body() dto: SendAwardDto) {
    return this.awardService.sendAward(dto, TaskScheduleMode.Active);
  }
  @Post('/import/excel')

  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file) {
    return await this.awardService.importExcel(file);
  }
  @Get('/export/excel')
  async exportExcel(@Query() qs: ExportAwardExcelQueryDto, @Res() res: Response) {
    await this.awardService.exportExcel(qs, res);
    // res.set('Content-Disposition', 'file.xlsx');
    // res.end(buffer);
  }
  @Get('/download/tmp')
  @Public()
  async downloadTmp(@Res() res: Response) {
    const buffer = await this.awardService.buildImportTmp();
    res.end(buffer);
  }
  @Get('/complete/delete')

  async deleteCompleteAward(@Query('id') id) {
    return this.awardService.seveCompleteTask({
      id,
      isDel: true,
    });
  }
  @Get('/busines/info')

  async getBusinessInfo(@Query('id') id) {
    const ret = await this.awardService.getBusinessAwardInfo(id);
    console.log('ret', ret);
    return ret;
  }
}
