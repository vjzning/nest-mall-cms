import { NestFactory } from '@nestjs/core';
import { CmsAdminApiModule } from '../cms-admin-api.module';
import { UserService } from '../user/user.service';
import { RoleService } from '../role/role.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CmsAdminApiModule);
  const userService = app.get(UserService);
  const roleService = app.get(RoleService);

  console.log('Seeding data...');

  // Create Admin Role
  let adminRole = await roleService.findOne(1); // Assuming ID 1 or find by code
  if (!adminRole) {
      // Try finding by code manually if service doesn't support it directly or just create
      const roles = await roleService.findAll();
      adminRole = roles.find(r => r.code === 'admin') || null;
      
      if (!adminRole) {
        console.log('Creating admin role...');
        adminRole = await roleService.create({
            code: 'admin',
            name: 'Super Admin',
            description: 'System Super Admin',
        });
      }
  }

  // Create Admin User
  let adminUser = await userService.findByUsername('admin');
  if (!adminUser) {
    console.log('Creating admin user...');
    await userService.create({
      username: 'admin',
      password: 'password', // Will be hashed by BeforeInsert
      nickname: 'Administrator',
      status: 1,
      roleIds: [adminRole.id],
    });
    console.log('Admin user created (password: password)');
  } else {
    console.log('Admin user already exists');
  }

  await app.close();
}

bootstrap();
