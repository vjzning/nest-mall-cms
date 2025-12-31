import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMenuDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  parentId?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  type: number;

  @IsString()
  @IsOptional()
  path?: string;

  @IsString()
  @IsOptional()
  component?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  sort?: number;
}
