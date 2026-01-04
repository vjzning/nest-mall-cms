import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuEntity } from '@app/db/entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuEntity)
    private menuRepository: Repository<MenuEntity>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<MenuEntity> {
    const menu = this.menuRepository.create(createMenuDto);
    return this.menuRepository.save(menu);
  }

  async findAll(): Promise<MenuEntity[]> {
    return this.menuRepository.find({ order: { sort: 'ASC' } });
  }

  async findOne(id: number): Promise<MenuEntity | null> {
    return this.menuRepository.findOne({ where: { id } });
  }

  async update(id: number, updateMenuDto: UpdateMenuDto): Promise<MenuEntity | null> {
    await this.menuRepository.update(id, updateMenuDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.menuRepository.delete(id);
  }

  async initDefaultMenus() {
    const mallMenu = await this.menuRepository.findOne({ where: { name: '商城管理' } });
    if (mallMenu) {
      const flashSaleMenu = await this.menuRepository.findOne({ where: { name: '秒杀管理' } });
      if (!flashSaleMenu) {
        await this.menuRepository.save({
          parentId: mallMenu.id,
          name: '秒杀管理',
          path: '/mall/flash-sale',
          component: 'mall/flash-sale/index',
          icon: 'Zap',
          type: 2,
          sort: 10,
          status: 1,
        });
      }
    }
  }
}
