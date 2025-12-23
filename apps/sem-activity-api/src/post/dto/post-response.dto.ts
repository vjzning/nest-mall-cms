import { ApiProperty } from '@nestjs/swagger';
export class PostResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty({ required: false })
  content?: string;
  @ApiProperty()
  userId: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
}