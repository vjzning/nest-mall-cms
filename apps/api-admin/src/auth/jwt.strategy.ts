import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          // 从 cookie 中提取（可选）
          const token = request?.cookies?.['admin_token'];
          if (token) return token;
          
          // 从查询参数中提取（仅用于方便访问 UI 页面，如 BullBoard）
          return request?.query?.token as string;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: any) {
    // 每次请求都去数据库查询最新的用户权限信息
    const user = await this.userService.findUserWithPermissions(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found or disabled');
    }
    return user;
  }
}
