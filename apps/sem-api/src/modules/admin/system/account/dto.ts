
import type { AccessEntity } from 'apps/sem-api/src/entity/access.entity';

import { AccessType } from 'apps/sem-api/src/common/enum';
import { RouterDto } from 'apps/sem-api/src/common/dto/index';

export class Account {

  readonly id?: number;
}
export class RoleDto {
  id: number;
  name?: string;
}

export class AccessDto {
  id: number;
}

export class CreateAccountDto extends Account {

  // @IsString({ message: '用户名必须为字符类型' })
  // @IsNotEmpty({ message: '用户名不能为空' })
  readonly username: string;


  // @IsString({ message: '密码必须为字符类型' })
  readonly password: string;


  roles: RoleDto[];


  readonly nickname: string;
}

export class UpdateAccountDto extends Account {
  roles?: RoleDto[];
  username?: string;
}
export class UpdateStatus {
  // @IsNotEmpty({ message: 'ID不能为空' })
  id: number;
  // @IsNotEmpty({ message: 'status不能为空' })
  status: number;
}

export class CreateRoleDto {

  // @IsString({ message: '用户名必须为字符类型' })
  // @IsNotEmpty({ message: '用户名不能为空' })
  readonly name: string;


  // @IsArray()
  access?: AccessEntity[];
}

export class UpdateRoleDto extends CreateRoleDto {
  // @IsNotEmpty({ message: '角色id不能为空' })
  id: number;
}
export class CreateAccessDto {

  name: string;
  
  type: AccessType;

  path: string;

  icon: string;
  
  parent: CreateAccessDto;
}

export class QueryId {

  // @IsNotEmpty()
  id: number | number[] | string;
}

export class LoginDto {

  username: string;

  password: string;
}

export class ResUserListDto {
  username: string;
}

export class CurrentUser {

  id?: number;
  nickname?: string;

  roles?: RoleDto[];
}

export class UpdateAccountBaseDto extends Account {

  email?: string;

  username?: string;

  nickname?: string;

  mobile?: string;
}

export class UpdateAccountPasswordDto extends Account {

  oldPassword?: string;

  newPassword1?: string;

  newPassword2?: string;
}
export class AllotRoleApiDto {

  roleId?: number;

  routers?: RouterDto[];
}

export class AccountListQueryDto {

  page?: number;


  pageSize?: number;
}
