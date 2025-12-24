import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateDictTypeDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreateDictDataDto {
  @IsString()
  typeCode: string;

  @IsString()
  label: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsInt()
  sort?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  meta?: any;

  @IsOptional()
  @IsString()
  remark?: string;
}
