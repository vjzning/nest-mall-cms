import { Controller, Get } from '@nestjs/common';
import { SemActivityApiService } from './sem-activity-api.service';

@Controller()
export class SemActivityApiController {
  constructor(private readonly semActivityApiService: SemActivityApiService) {}

  @Get()
  getHello(): string {
    return this.semActivityApiService.getHello();
  }
}
