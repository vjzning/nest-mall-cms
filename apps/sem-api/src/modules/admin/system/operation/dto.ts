import { ApiPropertyOptional } from "@nestjs/swagger";

export class CreateOpLogDto {
  @ApiPropertyOptional({required: true})
  module: string;
  content: string;
  user: number;
}
