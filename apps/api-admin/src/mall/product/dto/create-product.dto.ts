import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsArray,
    ValidateNested,
    IsInt,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductSkuDto {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    id?: number;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsOptional()
    specs: any;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    marketPrice: number;

    @IsInt()
    @Min(0)
    @Type(() => Number)
    stock: number;
}

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    categoryId: number;

    @IsString()
    @IsOptional()
    cover: string;

    @IsArray()
    @IsOptional()
    images: string[];

    @IsString()
    @IsOptional()
    detail: string;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    status: number;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    sort: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    shippingTemplateId: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    weight: number;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    volume: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateProductSkuDto)
    skus: CreateProductSkuDto[];
}
