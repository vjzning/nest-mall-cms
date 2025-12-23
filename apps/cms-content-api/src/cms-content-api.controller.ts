import { Controller, Get } from '@nestjs/common';
import { CmsContentApiService } from './cms-content-api.service';

@Controller()
export class CmsContentApiController {
  constructor(private readonly cmsContentApiService: CmsContentApiService) {}

  @Get()
  getHello(): string {
    return this.cmsContentApiService.getHello();
  }
}
