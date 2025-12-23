import { SetMetadata } from '@nestjs/common';
import { NoFormatResponse } from '../constants/const';
export const NoTransformResponse = () => SetMetadata(NoFormatResponse, true);
