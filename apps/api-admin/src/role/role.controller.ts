import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, UseInterceptors } from '@nestjs/common';
import { RoleService } from './role.service';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('role')
@UseInterceptors(LogInterceptor)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RequirePermissions('system:role:create')
  @Log({ module: '角色管理', action: '创建角色' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @RequirePermissions('system:role:list')
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @RequirePermissions('system:role:query')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Put(':id')
  @RequirePermissions('system:role:update')
  @Log({ module: '角色管理', action: '修改角色' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @RequirePermissions('system:role:delete')
  @Log({ module: '角色管理', action: '删除角色' })
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }

  @Post(':id/permissions')
  @RequirePermissions('system:role:assign')
  @Log({ module: '角色管理', action: '分配权限' })
  assignPermissions(@Param('id') id: string, @Body() assignPermissionsDto: AssignPermissionsDto) {
    return this.roleService.assignPermissions(+id, assignPermissionsDto.menuIds);
  }
}
