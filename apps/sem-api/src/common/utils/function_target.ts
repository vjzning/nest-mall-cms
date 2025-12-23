import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';
import { SaveAwardDto } from '../../modules/admin/system/activity/dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class FunctionsTarget {
  private readonly logger = new Logger(FunctionsTarget.name);
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManage,
  ) { }
  /**
   * description: 获取用户信息
   * @param param0 min max
   * @returns message
   */
  random({ min, max }) {
    // console.log('min', min, 'max', max);
    return _.random(min, max);
  }
  async eventAmount({ extParams }: { extParams: SaveAwardDto }) {
    // console.log('extParams', extParams);
    const amount = extParams.targetValue;
    return amount;
  }
}
