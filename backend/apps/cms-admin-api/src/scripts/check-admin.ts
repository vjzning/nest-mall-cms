import { NestFactory } from '@nestjs/core';
import { CmsAdminApiModule } from '../cms-admin-api.module';
import { UserService } from '../user/user.service';

async function checkAdminPermissions() {
  const app = await NestFactory.createApplicationContext(CmsAdminApiModule);
  const userService = app.get(UserService);

  const user = await userService.findByUsername('admin');
  console.log('User:', user?.username);
  
  if (user) {
    const fullUser = await userService.findUserWithPermissions(user.id);
    console.log('Full User Roles:', fullUser?.roles?.map(r => ({
        id: r.id,
        code: r.code,
        name: r.name
    })));

    const hasSuperAdminRole = fullUser?.roles?.some(role => role.code === 'admin');
    console.log('Has Super Admin Role (code === "admin")?', hasSuperAdminRole);
  } else {
    console.log('User admin not found');
  }

  await app.close();
}

checkAdminPermissions();
