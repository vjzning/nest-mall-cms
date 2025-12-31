import { IsString, IsInt, IsBoolean, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingRuleDto {
  @IsArray()
  @IsOptional()
  regionIds: string[];

  @IsNumber()
  @Type(() => Number)
  firstAmount: number;

  @IsNumber()
  @Type(() => Number)
  firstFee: number;

  @IsNumber()
  @Type(() => Number)
  extraAmount: number;

  @IsNumber()
  @Type(() => Number)
  extraFee: number;
}

export class ShippingFreeRuleDto {
  @IsArray()
  @IsOptional()
  regionIds: string[];

  @IsInt()
  @Type(() => Number)
  condType: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fullAmount?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  fullQuantity?: number;
}

export class CreateShippingTemplateDto {
  @IsString()
  name: string;

  @IsInt()
  @Type(() => Number)
  chargeType: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  status?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingRuleDto)
  rules: ShippingRuleDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ShippingFreeRuleDto)
  freeRules?: ShippingFreeRuleDto[];
}
