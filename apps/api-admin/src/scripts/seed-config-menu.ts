import { NestFactory } from '@nestjs/core';
import { CmsAdminApiModule } from '../cms-admin-api.module';
import { MenuService } from '../menu/menu.service';
import { RoleService } from '../role/role.service';
import { CreateMenuDto } from '../menu/dto/create-menu.dto';
import { MenuEntity } from '@app/db/entities/menu.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CmsAdminApiModule);
  const menuService = app.get(MenuService);
  const roleService = app.get(RoleService);

  console.log('Seeding system config menu...');

  // Helper to find or create menu
  const findOrCreateMenu = async (dto: CreateMenuDto): Promise<MenuEntity> => {
    const menus = await menuService.findAll();
    const existing = menus.find(m => m.code === dto.code);
    if (existing) {
      console.log(`Menu ${dto.name} (${dto.code}) already exists.`);
      return existing;
    }
    console.log(`Creating menu ${dto.name} (${dto.code})...`);
    return await menuService.create(dto);
  };

  // Find System Directory
  const menus = await menuService.findAll();
  let systemDir = menus.find(m => m.code === 'system');

  if (!systemDir) {
    console.log('System Management directory not found, skipping...');
    return;
  }

  // 1. System Config Menu
  const configMenu = await findOrCreateMenu({
    name: 'System Config',
    code: 'system:config',
    type: 2, // Menu
    parentId: systemDir.id,
    path: '/system/config',
    component: 'system/config',
    sort: 5, // After Dictionary Management
    icon: 'Settings2',
  });

  // Config Buttons
  await findOrCreateMenu({ name: 'Query Config', code: 'system:config:list', type: 3, parentId: configMenu.id, sort: 1 });
  await findOrCreateMenu({ name: 'Create Config', code: 'system:config:create', type: 3, parentId: configMenu.id, sort: 2 });
  await findOrCreateMenu({ name: 'Update Config', code: 'system:config:update', type: 3, parentId: configMenu.id, sort: 3 });
  await findOrCreateMenu({ name: 'Delete Config', code: 'system:config:delete', type: 3, parentId: configMenu.id, sort: 4 });

  console.log('System config menus seeded.');

  // Update Admin Role Permissions
  console.log('Updating Admin role permissions...');
  const allMenus = await menuService.findAll();
  const allMenuIds = allMenus.map(m => m.id);
  
  const roles = await roleService.findAll();
  const adminRole = roles.find(r => r.code === 'admin');
  
  if (adminRole) {
      await roleService.assignPermissions(adminRole.id, allMenuIds);
      console.log('Assigned all permissions to Admin role.');
  }

  await app.close();
}

bootstrap();
