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

  console.log('Seeding Mall menus...');

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

  // 1. Mall Management Directory
  const mallDir = await findOrCreateMenu({
    name: 'Mall Management',
    code: 'mall',
    type: 1, // Directory
    path: '/mall',
    sort: 3,
    icon: 'ShoppingBag',
  });

  // 2. Product Management
  const productMenu = await findOrCreateMenu({
    name: 'Product Management',
    code: 'mall:product',
    type: 2, // Menu
    parentId: mallDir.id,
    path: '/mall/product',
    component: 'mall/product/product-list', // Not strictly used by TanStack router but good for reference
    sort: 1,
    icon: 'Package',
  });

  // Product Buttons
  await findOrCreateMenu({ name: 'Query Product', code: 'mall:product:list', type: 3, parentId: productMenu.id, sort: 1 });
  await findOrCreateMenu({ name: 'Create Product', code: 'mall:product:create', type: 3, parentId: productMenu.id, sort: 2 });
  await findOrCreateMenu({ name: 'Update Product', code: 'mall:product:update', type: 3, parentId: productMenu.id, sort: 3 });
  await findOrCreateMenu({ name: 'Delete Product', code: 'mall:product:delete', type: 3, parentId: productMenu.id, sort: 4 });

  console.log('Mall Menus seeded.');

  // Assign all menus to Admin Role
  console.log('Assigning all menus to Admin role...');
  const allMenus = await menuService.findAll();
  const allMenuIds = allMenus.map(m => m.id);
  
  // Find admin role
  const roles = await roleService.findAll();
  const adminRole = roles.find(r => r.code === 'admin');
  
  if (adminRole) {
      await roleService.assignPermissions(adminRole.id, allMenuIds);
      console.log('Assigned all permissions to Admin role.');
  } else {
      console.warn('Admin role not found. Skipping permission assignment.');
  }

  await app.close();
}

bootstrap();
