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

  console.log('Seeding dictionary menus...');

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
    console.log('System Management directory not found, creating...');
    systemDir = await findOrCreateMenu({
        name: 'System Management',
        code: 'system',
        type: 1, // Directory
        path: '/system',
        sort: 1,
        icon: 'Settings',
    });
  }

  // 1. Dictionary Management
  const dictMenu = await findOrCreateMenu({
    name: 'Dictionary Management',
    code: 'system:dict',
    type: 2, // Menu
    parentId: systemDir.id,
    path: '/system/dict',
    component: 'system/dict', // Database component reference
    sort: 4, // After Menu Management
    icon: 'BookOpen', // Choose an appropriate icon
  });

  // Dictionary Buttons
  // Type Management
  await findOrCreateMenu({ name: 'Query Type', code: 'system:dict:type:query', type: 3, parentId: dictMenu.id, sort: 1 });
  await findOrCreateMenu({ name: 'Create Type', code: 'system:dict:type:create', type: 3, parentId: dictMenu.id, sort: 2 });
  await findOrCreateMenu({ name: 'Update Type', code: 'system:dict:type:update', type: 3, parentId: dictMenu.id, sort: 3 });
  await findOrCreateMenu({ name: 'Delete Type', code: 'system:dict:type:delete', type: 3, parentId: dictMenu.id, sort: 4 });

  // Data Management
  await findOrCreateMenu({ name: 'Query Data', code: 'system:dict:data:query', type: 3, parentId: dictMenu.id, sort: 5 });
  await findOrCreateMenu({ name: 'Create Data', code: 'system:dict:data:create', type: 3, parentId: dictMenu.id, sort: 6 });
  await findOrCreateMenu({ name: 'Update Data', code: 'system:dict:data:update', type: 3, parentId: dictMenu.id, sort: 7 });
  await findOrCreateMenu({ name: 'Delete Data', code: 'system:dict:data:delete', type: 3, parentId: dictMenu.id, sort: 8 });

  console.log('Dictionary menus seeded.');

  // Update Admin Role Permissions
  console.log('Updating Admin role permissions...');
  const allMenus = await menuService.findAll();
  const allMenuIds = allMenus.map(m => m.id);
  
  const roles = await roleService.findAll();
  const adminRole = roles.find(r => r.code === 'admin');
  
  if (adminRole) {
      await roleService.assignPermissions(adminRole.id, allMenuIds);
      console.log('Assigned all permissions (including dictionary) to Admin role.');
  } else {
      console.warn('Admin role not found. Skipping permission assignment.');
  }

  await app.close();
}

bootstrap();
