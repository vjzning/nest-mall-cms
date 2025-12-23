
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { BaseTableListParams } from 'apps/sem-api/src/common/dto/index';

export class CreateAwardDto {

  @IsNotEmpty()
  name?: string;

  weight?: number;

  @IsNotEmpty()
  category?: { id: number };

  keyId?: string;

  keyType?: string;

  group_name?: string;

  numAttr?: number;

  custom_param: [{ name: string; value: string }] | null;
}

export class CheckAwardDto {

  @IsNotEmpty()
  id?: number | number[];

  @IsNotEmpty()
  status?: number;
  desc?: string;
}
export class RewardDto {

  itemId: string;

  type?: string;

  number?: number;

  days?: number;
}
export class AwardItemDto {

  level?: any;

  reward?: RewardDto[];

  rewardName?: string;
  imContent: {
    imMsg?: string;
    imMsgTitle?: string;
    imMsgUrl?: string;
  };
  conditionTags?: any;
}
export class SendAwardDto {

  checkId?: number;

  userId?: string;

  activityName?: string;

  items?: AwardItemDto[];

  requestId?: string;
  checkIds?: number[];
  taskName?: string;
}
export class AwardResourceDto {
  type: string;
  amount: number;
  balanceRequired: number;
  source: number;
}
export class SendResourceDto {
  busUserId: string;
  activityId: number;
  uniqueCode: string;
  items: AwardResourceDto[];
  checkIds?: number[];
  completeIds?: number[];
  activityCode: string;
}

export class MappNameToIdDto {

  @IsArray()
  @IsOptional()
  awardNames: string[];

  @IsArray()
  @IsOptional()
  targetNames: string[];

  @IsArray()
  @IsOptional()
  taskNames: string[];

  @IsArray()
  @IsOptional()
  awardGroupNames: string[];

  @IsArray()
  @IsOptional()
  dataRule?: string[];
}

export class CheckAwardInfoQueryDto {

  id?: number | string;
}

export class ExportAwardExcelQueryDto extends BaseTableListParams {

  id?: number | string;
}
