// src/user/dto/create-user.dto.ts
import { IsString, IsOptional, IsUrl, IsInt, Min, Max } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsUrl()
  @IsOptional()
  avatar?: string;

  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number = 1;
}
