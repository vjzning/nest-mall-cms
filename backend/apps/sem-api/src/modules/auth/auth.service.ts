import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Utils } from 'apps/sem-api/src/common/utils/utils';
import { ErrorCode } from '../../common/constants/error';
import { MyHttpException } from '../../common/exception/my.http.exception';
import { UserEntity } from '../../entity/user.entity';
import { AccountService } from '../admin/system/account/account.service';
import { LoginDto } from '../admin/system/account/dto';
import { match } from 'path-to-regexp';
@Injectable()
export class AuthService {
  constructor(
    private utils: Utils,
    private readonly userService: AccountService,
    private readonly jwtService: JwtService
  ) { }
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOneAccount({ username });
    if (user && user.password) {
      const checkRet = this.utils.checkPassword(pass, user.password);
      if (checkRet) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }
  async login(user: LoginDto) {
    const payload = await this.validateUser(user.username, user.password);
    if (!payload) {
      throw new MyHttpException({
        statusCode: ErrorCode.LoginError.CODE,
      });
    }
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
  signToken(user: UserEntity) {
    return this.jwtService.sign(user);
  }
  async authApiPath(user: UserEntity, method, path): Promise<boolean> {
    const { is_super, id } = user;
    if (is_super) {
      return true;
    }
    const routers = await this.userService.getUserRoleApiAccess(id);
    return (
      routers.findIndex((i) => {
        const fn = match(i?.path || '');
        const matchRet = !!fn(path);
        return matchRet && i.method === method;
      }) !== -1
    );
    // return true;
  }
}
