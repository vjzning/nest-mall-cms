import { Injectable } from '@nestjs/common';

@Injectable()
export class CmsContentApiService {
  getHello(): string {
    return 'Hello World!';
  }
}
