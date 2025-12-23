// src/user/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  nickname?: string;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty({ default: 1 })
  status: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
