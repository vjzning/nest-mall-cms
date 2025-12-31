import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class DeliveryItemDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  skuId: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class OrderDeliveryDto {
  @IsString()
  @IsNotEmpty()
  trackingNo: string;

  @IsString()
  @IsNotEmpty()
  carrier: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryItemDto)
  items: DeliveryItemDto[];

  @IsString()
  @IsOptional()
  remark?: string;
}
