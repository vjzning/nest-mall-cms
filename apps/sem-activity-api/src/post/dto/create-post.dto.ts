import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  @IsOptional()
  content?: string;
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
