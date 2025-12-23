import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { TableListParams } from 'apps/sem-api/src/common/dto/index';
import { AccountService } from './account.service';
import { CreateRoleDto, QueryId, RoleDto, UpdateRoleDto } from './dto';

@Controller('role')
export class RoleController {
  constructor(private readonly accountService: AccountService) {}
  @Get()
  index(@Query() qs: TableListParams) {
    return this.accountService.getRoleList(qs);
  }

  @Post('/add')
  add(@Body() body: CreateRoleDto) {
    return this.accountService.createRole(body);
  }
  @Post('/update')
  update(@Body() body: UpdateRoleDto) {
    return this.accountService.updateRole(body);
  }
  @Post('/del')
  del(@Body() body: QueryId) {
    // return body;
    return this.accountService.deleteRole(body.id);
  }
}
