import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FlashSaleOrderDto {
    @IsNumber()
    @Type(() => Number)
    activityId: number;

    @IsNumber()
    @Type(() => Number)
    skuId: number;

    @IsNumber()
    @Type(() => Number)
    addressId: number;
}
