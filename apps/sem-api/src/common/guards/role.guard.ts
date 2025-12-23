import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Cache } from 'cache-manager';
import { request } from 'express';
import { Observable } from 'rxjs';
import { AuthService } from '../../modules/auth/auth.service';
import { IsPublic, NO_AUTH } from '../constants/const';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) protected cacheManager: Cache,
    private reflector?: Reflector
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const noAuth = this.reflector.getAllAndOverride(NO_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isPub = this.reflector.getAllAndOverride(IsPublic, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (noAuth || isPub) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    return await this.authService.authApiPath(
      request.user,
      request.method,
      request.path
    );
  }
}
