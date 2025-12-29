import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('user')
@UseInterceptors(LogInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RequirePermissions('system:user:create')
  @Log({ module: '用户管理', action: '创建用户' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @RequirePermissions('system:user:list')
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @RequirePermissions('system:user:query')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Put(':id')
  @RequirePermissions('system:user:update')
  @Log({ module: '用户管理', action: '修改用户' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @RequirePermissions('system:user:delete')
  @Log({ module: '用户管理', action: '删除用户' })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post(':id/reset-password')
  @RequirePermissions('system:user:update')
  @Log({ module: '用户管理', action: '重置密码' })
  resetPassword(@Param('id') id: string) {
    return this.userService.resetPassword(+id);
  }
}
