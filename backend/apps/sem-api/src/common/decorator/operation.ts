import { SetMetadata } from '@nestjs/common';
import { OPERATIONLOG } from '../constants/const';
export const OperationLogDecorator = (params) =>
  SetMetadata(OPERATIONLOG, params);
