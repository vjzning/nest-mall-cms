import { Injectable } from '@nestjs/common';

@Injectable()
export class SemActivityApiService {
  getHello(): string {
    return 'Hello World!';
  }
}
