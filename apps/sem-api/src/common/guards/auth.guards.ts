import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard, Type, IAuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import { IsPublic } from '../constants/const';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class MyAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger();
  constructor(
    @Inject(CACHE_MANAGER) protected cacheManager,
    private readonly authService: AuthService,
    private reflector?: Reflector
  ) {
    super();
  }
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | import('rxjs').Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride(IsPublic, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
  handleRequest(err, user, info, context: ExecutionContext, status?: any) {
    // info instanceof JsonWebTokenError
    // 可以抛出一个基于info或者err参数的异常
    // console.log(err, user, info);
    // console.log(11, options, 22, status, context);
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    const request: Request = context.switchToHttp().getRequest();
    const { exp, iat, ...otherUserPro } = user;
    const now = Math.floor(Date.now() / 1000);
    // 过期时间为2天，提前1天刷新token
    const oneDay = 60 * 60 * 24;
    const weekDay = 60 * 60 * 24 * 7;
    // console.log(exp, now, exp - now, 60 * 60 * 24);
    if (exp - now < oneDay) {
      const token = this.authService.signToken(otherUserPro);
      request.res.setHeader('Authorization', token);
    }
    // 如果过期时间大于7天，要求重新登录
    if (exp - now > weekDay) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
