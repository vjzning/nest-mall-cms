import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class AssignPermissionsDto {
  @IsArray()
  @IsNotEmpty()
  @IsInt({ each: true })
  menuIds: number[];
}
