import { IsString, IsOptional, IsInt, IsArray, IsEnum, IsDateString } from 'class-validator';

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
  status?: number;

  @IsInt()
  @IsOptional()
  isTop?: number;

  @IsInt()
  @IsOptional()
  isRecommend?: number;

  @IsInt()
  @IsOptional()
  views?: number;

  @IsInt()
  @IsOptional()
  likes?: number;

  @IsDateString()
  @IsOptional()
  publishedAt?: Date;

  @IsInt()
  @IsOptional()
  categoryId?: number;

  @IsArray()
  @IsOptional()
  tagIds?: number[];
}
