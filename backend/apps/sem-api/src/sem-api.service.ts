
import { Inject, Injectable, Req } from '@nestjs/common';
@Injectable()
export class SemApiService {
  request: any;
  setRequest(req: any) {
    throw new Error('Method not implemented.');
  }
  getHello(): string {
    const a = undefined;
    return 'Hello World! 33';
  }
}
