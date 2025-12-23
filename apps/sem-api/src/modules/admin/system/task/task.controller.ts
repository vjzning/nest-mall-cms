import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';

import { OperationLogDecorator } from 'apps/sem-api/src/common/decorator/operation';
import { Public } from 'apps/sem-api/src/common/decorator/public';
import { BaseTableListParams } from 'apps/sem-api/src/common/dto/index';
import { QueryId, UpdateStatus } from '../account/dto';
import { SaveCategoryDto, SaveTaskDto } from './dto';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}
  @Get('category/list')

  getCategory(@Query() query: BaseTableListParams) {
    return this.taskService.getTaskCategory(query);
  }
  @Post('category/add')

  @OperationLogDecorator(['任务分类', '添加'])
  addCategory(@Body() body: SaveCategoryDto) {
    return this.taskService.saveCategory(body);
  }
  @Post('category/update')

  @OperationLogDecorator(['任务分类', '修改'])
  updateCategory(@Body() body: SaveCategoryDto) {
    return this.taskService.saveCategory(body);
  }
  @Delete('category/delete')

  @OperationLogDecorator(['任务', '删除'])
  deleteCategory(@Body() body: QueryId) {
    return this.taskService.deleteCategory(body);
  }
  @Post('/save')
  @OperationLogDecorator(['任务', '添加'])

  createTask(@Body() body: SaveTaskDto) {
    return this.taskService.saveTask(body);
  }
  @Get('/list')

  getTaskList(@Query() query: BaseTableListParams) {
    return this.taskService.getTaskList(query);
  }
  @Get('/options')
  @Public()
  getTaskAllOptions() {
    return this.taskService.getOptions({});
  }
  @Post('/status/update')

  @OperationLogDecorator(['任务', '状态更新'])
  async updateStatus(@Body() body: UpdateStatus) {
    await this.taskService.updateStatus(body);
    return true;
  }
  @Delete('/delete')

  @OperationLogDecorator(['任务', '删除'])
  async deleteTask(@Body() qs: QueryId) {
    return this.taskService.deleteTask(qs);
  }
}
