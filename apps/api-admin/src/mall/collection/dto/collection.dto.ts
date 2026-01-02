import { IsString, IsOptional, IsEnum, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CollectionType, CollectionLayout } from '@app/shared';

export class CreateCollectionItemDto {
  @IsNumber()
  @Type(() => Number)
  targetId: number;

  @IsString()
  @IsOptional()
  titleOverride?: string;

  @IsString()
  @IsOptional()
  imageOverride?: string;

  @IsString()
  @IsOptional()
  extraTag?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sort?: number = 0;
}

export class CreateCollectionDto {
  @IsString()
  code: string;

  @IsEnum(CollectionType)
  type: CollectionType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsEnum(CollectionLayout)
  @IsOptional()
  layoutType?: CollectionLayout = CollectionLayout.GRID;

  @IsString()
  @IsOptional()
  bgColor?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  status?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sort?: number = 0;

  @IsOptional()
  @Type(() => Date)
  startAt?: Date;

  @IsOptional()
  @Type(() => Date)
  endAt?: Date;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateCollectionItemDto)
  items?: CreateCollectionItemDto[];
}

export class UpdateCollectionDto extends CreateCollectionDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  id?: number;
}
