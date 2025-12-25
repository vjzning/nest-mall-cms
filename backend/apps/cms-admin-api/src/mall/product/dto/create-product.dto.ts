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
import { Type, Transform } from 'class-transformer';

export class CreateProductSkuDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  specs: any;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  marketPrice: number;

  @IsInt()
  @Min(0)
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
  @Transform(({ value }) => parseInt(value))
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
  status: number;

  @IsInt()
  @IsOptional()
  sort: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductSkuDto)
  skus: CreateProductSkuDto[];
}
