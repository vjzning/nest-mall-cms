import { IsEnum, IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AfterSaleType } from '@app/db/entities/mall-after-sale.entity';

class AfterSaleItemDto {
  @IsNumber()
  @Type(() => Number)
  orderItemId: number;

  @IsNumber()
  @Type(() => Number)
  quantity: number;
}

export class ApplyAfterSaleDto {
  @IsNumber()
  @Type(() => Number)
  orderId: number;

  @IsEnum(AfterSaleType)
  type: AfterSaleType;

  @IsString()
  applyReason: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AfterSaleItemDto)
  items: AfterSaleItemDto[];
}

export class SubmitLogisticsDto {
  @IsString()
  trackingNo: string;

  @IsString()
  carrier: string;
}
