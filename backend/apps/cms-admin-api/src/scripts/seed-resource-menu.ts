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

  console.log('Seeding resource menus...');

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

  // Find Content Management Directory
  const menus = await menuService.findAll();
  let contentDir = menus.find(m => m.code === 'content');

  if (!contentDir) {
    console.log('Content Management directory not found, skipping...');
    return; 
  }

  // 1. Resource Management
  const resourceMenu = await findOrCreateMenu({
    name: 'Resource Management',
    code: 'content:resource',
    type: 2, // Menu
    parentId: contentDir.id,
    path: '/content/resource', // Note: Route path in frontend is /resource or /content/resource, let's stick to menu structure
    component: 'resource/resource-list',
    sort: 5, // After Comment Management
    icon: 'Image', 
  });

  // Resource Buttons
  await findOrCreateMenu({ name: 'Query Resource', code: 'content:resource:list', type: 3, parentId: resourceMenu.id, sort: 1 });
  await findOrCreateMenu({ name: 'Upload Resource', code: 'content:resource:upload', type: 3, parentId: resourceMenu.id, sort: 2 });
  await findOrCreateMenu({ name: 'Delete Resource', code: 'content:resource:delete', type: 3, parentId: resourceMenu.id, sort: 3 });

  console.log('Resource menus seeded.');

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
