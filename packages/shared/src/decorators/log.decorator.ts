import { SetMetadata } from '@nestjs/common';

export interface LogOptions {
  module: string;
  action: string;
}

export const LOG_KEY = 'log_key';
export const Log = (options: LogOptions) => SetMetadata(LOG_KEY, options);
