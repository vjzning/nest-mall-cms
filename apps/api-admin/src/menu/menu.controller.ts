import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    UseGuards,
    Request,
    UseInterceptors,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { UserService } from '../user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../common/decorators/auth.decorator';
import { MenuEntity } from '@app/db/entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { Log } from '@app/shared/decorators/log.decorator';
import { LogInterceptor } from '@app/shared/interceptors/log.interceptor';

@Controller('menu')
@UseInterceptors(LogInterceptor)
export class MenuController {
    constructor(
        private readonly menuService: MenuService,
        private readonly userService: UserService
    ) {}

    @Get('my-menus')
    async getMyMenus(@Request() req) {
        const user = req.user;
        if (user.username === 'admin') {
            return this.menuService.findAll();
        }
        const userWithPermissions =
            await this.userService.findUserWithPermissions(user.id);
        if (!userWithPermissions) return [];

        // Extract menus from roles
        const menus: MenuEntity[] = [];
        const menuIds = new Set();

        userWithPermissions.roles.forEach((role) => {
            role.menus.forEach((menu) => {
                if (!menuIds.has(menu.id)) {
                    menuIds.add(menu.id);
                    menus.push(menu);
                }
            });
        });

        // Sort by sort field
        return menus.sort((a, b) => a.sort - b.sort);
    }

    @Post()
    @RequirePermissions('system:menu:create')
    @Log({ module: '菜单管理', action: '创建菜单' })
    create(@Body() createMenuDto: CreateMenuDto) {
        return this.menuService.create(createMenuDto);
    }

    @Get()
    @RequirePermissions('system:menu:list')
    findAll() {
        return this.menuService.findAll();
    }

    @Get(':id')
    @RequirePermissions('system:menu:query')
    findOne(@Param('id') id: string) {
        return this.menuService.findOne(+id);
    }

    @Put(':id')
    @RequirePermissions('system:menu:update')
    @Log({ module: '菜单管理', action: '修改菜单' })
    update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
        return this.menuService.update(+id, updateMenuDto);
    }

    @Delete(':id')
    @RequirePermissions('system:menu:delete')
    @Log({ module: '菜单管理', action: '删除菜单' })
    remove(@Param('id') id: string) {
        return this.menuService.remove(+id);
    }
}
