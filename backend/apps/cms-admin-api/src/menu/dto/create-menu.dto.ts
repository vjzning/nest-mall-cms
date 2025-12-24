import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateMenuDto {
  @IsInt()
  @IsOptional()
  parentId?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @IsNotEmpty()
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
  sort?: number;
}
