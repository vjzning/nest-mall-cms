import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { RegionService } from './region.service';
import { Public } from '../../common/decorators/auth.decorator';

@Controller('system/region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  /**
   * 获取省市区树形结构
   */
  @Public()
  @Get('tree')
  async getTree() {
    return this.regionService.getTree();
  }

  /**
   * 获取下级地区
   */
  @Public()
  @Get('list')
  async getList(@Query('parentCode') parentCode?: string) {
    if (!parentCode) {
      return this.regionService.getProvinces();
    }
    return this.regionService.getChildren(parentCode);
  }

  /**
   * 初始化省市区数据
   */
  @Public()
  @Post('init')
  async init(@Body() data: any[]) {
    const count = await this.regionService.seed(data);
    return { success: true, count };
  }
}
