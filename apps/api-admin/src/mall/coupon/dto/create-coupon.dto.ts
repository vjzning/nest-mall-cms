import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsDateString, IsInt, IsJSON, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CouponType, CouponCategory, CouponScopeType, CouponValidityType, CouponStatus } from '@app/db/entities/mall-coupon.entity';

export class CreateCouponDto {
  @IsString()
  name: string;

  @IsEnum(CouponType)
  @Type(() => Number)
  type: CouponType;

  @IsEnum(CouponCategory)
  @IsOptional()
  @Type(() => Number)
  category?: CouponCategory;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  value: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minAmount?: number;

  @IsEnum(CouponScopeType)
  @IsOptional()
  @Type(() => Number)
  scopeType?: CouponScopeType;

  @IsBoolean()
  @IsOptional()
  isStackable?: boolean;

  @IsOptional()
  stackingRules?: any;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  totalQuantity?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  userLimit?: number;

  @IsEnum(CouponValidityType)
  @IsOptional()
  @Type(() => Number)
  validityType?: CouponValidityType;

  @IsDateString()
  @IsOptional()
  startTime?: Date;

  @IsDateString()
  @IsOptional()
  endTime?: Date;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  validDays?: number;

  @IsEnum(CouponStatus)
  @IsOptional()
  @Type(() => Number)
  status?: CouponStatus;

  @IsOptional()
  @IsInt({ each: true })
  @Type(() => Number)
  scopeTargetIds?: number[];
}
