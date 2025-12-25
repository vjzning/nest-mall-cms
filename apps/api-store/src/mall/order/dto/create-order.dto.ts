import { IsNotEmpty, IsNumber, IsString, IsArray, ValidateNested, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNumber()
  skuId: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ReceiverInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => ReceiverInfoDto)
  receiverInfo: ReceiverInfoDto;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
  
  // In real world, memberId comes from JWT token, not body. 
  // But for now, we might extract it from Request in Controller.
}
