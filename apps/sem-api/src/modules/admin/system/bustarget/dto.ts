
import { TargetType } from 'apps/sem-api/src/common/enum';
import { IsNotEmpty } from 'class-validator';

export class SaveBusTargetDto {

  @IsNotEmpty()
  name?: string;

  description?: string;

  zipPath?: string;

  id?: number;

  status?: number;

  functionName?: string;

  type?: TargetType;
}
