import { Controller, Get } from '@nestjs/common';
import { CmsAdminApiService } from './cms-admin-api.service';

@Controller()
export class CmsAdminApiController {
  constructor(private readonly cmsAdminApiService: CmsAdminApiService) {}

  @Get()
  getHello(): string {
    return this.cmsAdminApiService.getHello();
  }
}
