import { Injectable } from '@nestjs/common';

@Injectable()
export class CmsAdminApiService {
  getHello(): string {
    return 'Hello World!';
  }
}
