import { IsString, IsNotEmpty, IsInt, IsOptional, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMallCategoryDto {
  @ApiProperty({ description: '分类名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '父级ID', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  parentId: number;

  @ApiPropertyOptional({ description: '分类图标' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: '分类大图/Banner' })
  @IsString()
  @IsOptional()
  pic?: string;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  sort?: number;

  @ApiPropertyOptional({ description: '状态 1:启用 0:禁用', default: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  status?: number;

  @ApiPropertyOptional({ description: '是否推荐 1:是 0:否', default: 0 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  isRecommend?: number;
}

export class UpdateMallCategoryDto extends CreateMallCategoryDto {}
