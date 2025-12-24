import { SetMetadata } from '@nestjs/common';
import { NO_AUTH } from '../constants/const';
export const NoAuth = () => SetMetadata(NO_AUTH, true);
