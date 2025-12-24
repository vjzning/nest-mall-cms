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

  console.log('Seeding menus...');

  // Helper to find or create menu
  const findOrCreateMenu = async (dto: CreateMenuDto): Promise<MenuEntity> => {
    const menus = await menuService.findAll();
    const existing = menus.find(m => m.code === dto.code);
    if (existing) {
      console.log(`Menu ${dto.name} (${dto.code}) already exists.`);
      // Update parentId if needed, but for now just return
      return existing;
    }
    console.log(`Creating menu ${dto.name} (${dto.code})...`);
    return await menuService.create(dto);
  };

  // 1. System Management Directory
  const systemDir = await findOrCreateMenu({
    name: 'System Management',
    code: 'system',
    type: 1, // Directory
    path: '/system',
    sort: 1,
    icon: 'Settings',
  });

  // 2. User Management
  const userMenu = await findOrCreateMenu({
    name: 'User Management',
    code: 'system:user',
    type: 2, // Menu
    parentId: systemDir.id,
    path: '/system/user',
    component: 'user/user-list',
    sort: 1,
    icon: 'User',
  });

  // User Buttons
  await findOrCreateMenu({ name: 'Query User', code: 'system:user:list', type: 3, parentId: userMenu.id, sort: 1 });
  await findOrCreateMenu({ name: 'Create User', code: 'system:user:create', type: 3, parentId: userMenu.id, sort: 2 });
  await findOrCreateMenu({ name: 'Update User', code: 'system:user:update', type: 3, parentId: userMenu.id, sort: 3 });
  await findOrCreateMenu({ name: 'Delete User', code: 'system:user:delete', type: 3, parentId: userMenu.id, sort: 4 });
  await findOrCreateMenu({ name: 'User Detail', code: 'system:user:query', type: 3, parentId: userMenu.id, sort: 5 });


  // 3. Role Management
  const roleMenu = await findOrCreateMenu({
    name: 'Role Management',
    code: 'system:role',
    type: 2, // Menu
    parentId: systemDir.id,
    path: '/system/role',
    component: 'role/role-list',
    sort: 2,
    icon: 'Shield',
  });

  // Role Buttons
  await findOrCreateMenu({ name: 'Query Role', code: 'system:role:list', type: 3, parentId: roleMenu.id, sort: 1 });
  await findOrCreateMenu({ name: 'Create Role', code: 'system:role:create', type: 3, parentId: roleMenu.id, sort: 2 });
  await findOrCreateMenu({ name: 'Update Role', code: 'system:role:update', type: 3, parentId: roleMenu.id, sort: 3 });
  await findOrCreateMenu({ name: 'Delete Role', code: 'system:role:delete', type: 3, parentId: roleMenu.id, sort: 4 });
  await findOrCreateMenu({ name: 'Role Detail', code: 'system:role:query', type: 3, parentId: roleMenu.id, sort: 5 });
  await findOrCreateMenu({ name: 'Assign Permissions', code: 'system:role:assign', type: 3, parentId: roleMenu.id, sort: 6 });

  // 4. Menu Management
  const menuMenu = await findOrCreateMenu({
    name: 'Menu Management',
    code: 'system:menu',
    type: 2, // Menu
    parentId: systemDir.id,
    path: '/system/menu',
    component: 'menu/menu-list',
    sort: 3,
    icon: 'Menu',
  });

  // Menu Buttons
  await findOrCreateMenu({ name: 'Query Menu', code: 'system:menu:list', type: 3, parentId: menuMenu.id, sort: 1 });
  await findOrCreateMenu({ name: 'Create Menu', code: 'system:menu:create', type: 3, parentId: menuMenu.id, sort: 2 });
  await findOrCreateMenu({ name: 'Update Menu', code: 'system:menu:update', type: 3, parentId: menuMenu.id, sort: 3 });
  await findOrCreateMenu({ name: 'Delete Menu', code: 'system:menu:delete', type: 3, parentId: menuMenu.id, sort: 4 });
  await findOrCreateMenu({ name: 'Menu Detail', code: 'system:menu:query', type: 3, parentId: menuMenu.id, sort: 5 });


  // 5. Content Management Directory
  const contentDir = await findOrCreateMenu({
    name: 'Content Management',
    code: 'content',
    type: 1, // Directory
    path: '/content',
    sort: 2,
    icon: 'FileText',
  });

  // 6. Article Management
  const articleMenu = await findOrCreateMenu({
    name: 'Article Management',
    code: 'cms:article',
    type: 2, // Menu
    parentId: contentDir.id,
    path: '/content/article',
    component: 'content/article/article-list',
    sort: 1,
    icon: 'File',
  });

  // Article Buttons
  await findOrCreateMenu({ name: 'Query Article', code: 'cms:article:list', type: 3, parentId: articleMenu.id, sort: 1 });
  await findOrCreateMenu({ name: 'Create Article', code: 'cms:article:create', type: 3, parentId: articleMenu.id, sort: 2 });
  await findOrCreateMenu({ name: 'Update Article', code: 'cms:article:update', type: 3, parentId: articleMenu.id, sort: 3 });
  await findOrCreateMenu({ name: 'Delete Article', code: 'cms:article:delete', type: 3, parentId: articleMenu.id, sort: 4 });
  await findOrCreateMenu({ name: 'Article Detail', code: 'cms:article:query', type: 3, parentId: articleMenu.id, sort: 5 });
  await findOrCreateMenu({ name: 'Audit Article', code: 'cms:article:audit', type: 3, parentId: articleMenu.id, sort: 6 });

  // 7. Category Management
  const categoryMenu = await findOrCreateMenu({
    name: 'Category Management',
    code: 'cms:category',
    type: 2, // Menu
    parentId: contentDir.id,
    path: '/content/category',
    component: 'content/category/category-list',
    sort: 2,
    icon: 'Folder',
  });

  // Category Buttons
  await findOrCreateMenu({ name: 'Query Category', code: 'cms:category:list', type: 3, parentId: categoryMenu.id, sort: 1 });
  await findOrCreateMenu({ name: 'Create Category', code: 'cms:category:create', type: 3, parentId: categoryMenu.id, sort: 2 });
  await findOrCreateMenu({ name: 'Update Category', code: 'cms:category:update', type: 3, parentId: categoryMenu.id, sort: 3 });
  await findOrCreateMenu({ name: 'Delete Category', code: 'cms:category:delete', type: 3, parentId: categoryMenu.id, sort: 4 });
  await findOrCreateMenu({ name: 'Category Detail', code: 'cms:category:query', type: 3, parentId: categoryMenu.id, sort: 5 });

  // 8. Tag Management
  const tagMenu = await findOrCreateMenu({
    name: 'Tag Management',
    code: 'cms:tag',
    type: 2, // Menu
    parentId: contentDir.id,
    path: '/content/tag',
    component: 'content/tag/tag-list',
    sort: 3,
    icon: 'Tags',
  });

  // Tag Buttons
  await findOrCreateMenu({ name: 'Query Tag', code: 'cms:tag:list', type: 3, parentId: tagMenu.id, sort: 1 });
  await findOrCreateMenu({ name: 'Create Tag', code: 'cms:tag:create', type: 3, parentId: tagMenu.id, sort: 2 });
  await findOrCreateMenu({ name: 'Update Tag', code: 'cms:tag:update', type: 3, parentId: tagMenu.id, sort: 3 });
  await findOrCreateMenu({ name: 'Delete Tag', code: 'cms:tag:delete', type: 3, parentId: tagMenu.id, sort: 4 });
  await findOrCreateMenu({ name: 'Tag Detail', code: 'cms:tag:query', type: 3, parentId: tagMenu.id, sort: 5 });

  // 9. Comment Management
  const commentMenu = await findOrCreateMenu({
    name: 'Comment Management',
    code: 'cms:comment',
    type: 2, // Menu
    parentId: contentDir.id,
    path: '/content/comment',
    component: 'content/comment',
    sort: 4,
    icon: 'MessageSquare',
  });

  // Comment Buttons
  await findOrCreateMenu({ name: 'Query Comment', code: 'cms:comment:list', type: 3, parentId: commentMenu.id, sort: 1 });
  await findOrCreateMenu({ name: 'Delete Comment', code: 'cms:comment:delete', type: 3, parentId: commentMenu.id, sort: 2 }); 
  await findOrCreateMenu({ name: 'Update Comment', code: 'cms:comment:update', type: 3, parentId: commentMenu.id, sort: 3 }); 



  console.log('Menus seeded.');

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
