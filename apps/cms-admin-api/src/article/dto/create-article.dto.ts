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
  summary?: string;

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
  views?: number;

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
