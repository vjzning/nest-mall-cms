import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from '@app/db/entities/menu.entity';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { UserModule } from '../user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([MenuEntity]), UserModule],
    providers: [MenuService],
    controllers: [MenuController],
    exports: [MenuService],
})
export class MenuModule implements OnModuleInit {
    constructor(private readonly menuService: MenuService) {}

    async onModuleInit() {
        // await this.menuService.initDefaultMenus();
    }
}
