import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, PERMISSIONS_KEY } from '../common/decorators/auth.decorator';
import { RoleEntity } from '@app/db/entities/role.entity';
import { MenuEntity } from '@app/db/entities/menu.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    // Debug logging
    console.log('PermissionsGuard User:', user?.username);
    console.log('PermissionsGuard Roles:', user?.roles?.map(r => r.code));
    
    if (!user || !user.roles) {
      console.log('PermissionsGuard: No user or roles found');
      return false;
    }

    // Check if user has super admin role
    const hasSuperAdminRole = user.roles?.some((role: RoleEntity) => role.code === 'admin');
    console.log('PermissionsGuard: Is Super Admin?', hasSuperAdminRole);
    
    if (hasSuperAdminRole) {
      return true;
    }

    // Flatten all permissions from user's roles
    const userPermissions: string[] = user.roles?.flatMap((role: RoleEntity) =>
      role.menus?.map((menu: MenuEntity) => menu.code) || [],
    ) || [];

    return requiredPermissions.some((permission) => userPermissions.includes(permission));
  }
}
