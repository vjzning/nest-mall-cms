import { SetMetadata } from '@nestjs/common';
import { IsPublic } from '../constants/const';
export const Public = () => SetMetadata(IsPublic, true);
