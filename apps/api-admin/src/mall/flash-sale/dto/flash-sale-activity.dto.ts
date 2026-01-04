import { IsString, IsOptional, IsDateString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFlashSaleProductDto {
    @IsNumber()
    @Type(() => Number)
    productId: number;

    @IsNumber()
    @Type(() => Number)
    skuId: number;

    @IsNumber()
    @Type(() => Number)
    flashPrice: number;

    @IsNumber()
    @Type(() => Number)
    stock: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    limitPerUser?: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    sort?: number;
}

export class CreateFlashSaleActivityDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    bannerUrl?: string;

    @IsDateString()
    startTime: string;

    @IsDateString()
    endTime: string;

    @IsString()
    @IsOptional()
    remark?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateFlashSaleProductDto)
    products: CreateFlashSaleProductDto[];
}

export class UpdateFlashSaleActivityDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    bannerUrl?: string;

    @IsDateString()
    @IsOptional()
    startTime?: string;

    @IsDateString()
    @IsOptional()
    endTime?: string;

    @IsString()
    @IsOptional()
    remark?: string;

    @IsNumber()
    @IsOptional()
    status?: number;
}
