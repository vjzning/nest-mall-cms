import { IsString, IsOptional, IsInt, IsArray, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  cover?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  status?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  isTop?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  isRecommend?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  views?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  likes?: number;

  @IsDateString()
  @IsOptional()
  publishedAt?: Date;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

  @IsArray()
  @IsOptional()
  @Type(() => Number)
  tagIds?: number[];
}
