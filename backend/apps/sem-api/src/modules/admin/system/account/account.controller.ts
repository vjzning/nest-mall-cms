import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiResponseProperty,
} from '@nestjs/swagger';
import { ErrorCode } from 'apps/sem-api/src/common/constants/error';
import { NoAuth } from 'apps/sem-api/src/common/decorator/no.auth';
import { OperationLogDecorator } from 'apps/sem-api/src/common/decorator/operation';
import { Public } from 'apps/sem-api/src/common/decorator/public';
import { User } from 'apps/sem-api/src/common/decorator/usesr.decorator';
import { MyHttpException } from 'apps/sem-api/src/common/exception/my.http.exception';
import { SystemConfigService } from '../config/config.service';
import { AccountService } from './account.service';
import {
  CreateAccountDto,
  QueryId,
  CurrentUser,
  UpdateAccountDto,
  UpdateStatus,
  UpdateAccountPasswordDto,
  UpdateAccountBaseDto,
  AllotRoleApiDto,
  AccountListQueryDto,
} from './dto';
@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly sysConfigSevice: SystemConfigService
  ) {}
  @Get('/list')
  @ApiOperation({ summary: '用户列表' })
  async geAccount(@Query() qs: AccountListQueryDto) {
    const list = this.accountService.getAccountList(qs.page, qs.pageSize);
    return list;
  }
  @Get('/info')
  @NoAuth()
  @ApiResponse({ type: CurrentUser })
  async getAccountInfo(@Req() req) {
    //获取账户全局的相关数据.
    const roles = await this.accountService.getAllRoles();
    const user = req?.user;
    const info = await this.accountService.findOneAccount({
      id: user?.id,
    });
    delete info.password;
    return {
      ...info,
      roles,
      sysConfig: await this.sysConfigSevice.getSysConfig(),
    };
  }
  @Post('/add')
  @OperationLogDecorator(['用户', '添加'])
  @ApiOperation({ summary: '添加用户' })
  async createAccount(@Body() body: CreateAccountDto) {
    const ret = await this.accountService.findOneAccount({
      username: body.username,
    });
    if (ret) {
      throw new MyHttpException({
        statusCode: ErrorCode.UserNameExists.CODE,
      });
    }
    return this.accountService.createAccount(body);
  }
  @Patch('/update/role')
  @OperationLogDecorator(['用户', '更新角色'])
  @ApiOperation({ summary: '更新用户角色' })
  async uploadAccount(@Body() body: UpdateAccountDto) {
    return this.accountService.updateRoleAccount(body);
  }
  @Delete('/delete')
  @OperationLogDecorator(['用户', '删除'])
  @ApiOperation({ summary: '删除用户' })
  async deleteAccount(@Body() body: QueryId) {
    return this.accountService.deleteAccount(body);
  }
  @Post('/update/status')
  @OperationLogDecorator(['用户', '禁用/启用'])
  @ApiOperation({ summary: '禁用/启用用户' })
  async updateStatus(@Body() body: UpdateStatus) {
    return this.accountService.updateAccountStatus(body);
  }
  @Patch('/update/base')
  @OperationLogDecorator(['用户', '编辑基本信息'])
  @Public()
  async uploadAccountBase(@Body() body: UpdateAccountBaseDto, @Req() req) {
    if (body.id != req?.user?.id) {
      throw new MyHttpException({ statusCode: ErrorCode.Forbidden.CODE });
    }
    return this.accountService.updateAccountBaesInfo(body);
  }
  @OperationLogDecorator(['用户', '修改密码'])
  @Patch('/update/password')
  async uploadAccountPassword(
    @User() user,
    @Body() body: UpdateAccountPasswordDto
  ) {
    return this.accountService.updateAccountPasword(user, body);
  }
  @Get('/router/api')
  @Public()
  async getRoutersApi() {
    return this.accountService.getRoutersApi();
  }
  @Post('/allot/api')
  async allotApi(@Body() dto: AllotRoleApiDto) {
    return this.accountService.allotApi(dto);
  }
}
