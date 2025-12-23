import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RoleEntity } from '@app/db/entities/role.entity';
import { MenuEntity } from '@app/db/entities/menu.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(MenuEntity)
    private menuRepository: Repository<MenuEntity>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async findAll(): Promise<RoleEntity[]> {
    return this.roleRepository.find();
  }

  async findOne(id: number): Promise<RoleEntity | null> {
    return this.roleRepository.findOne({ where: { id }, relations: ['menus'] });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<RoleEntity | null> {
    await this.roleRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.roleRepository.delete(id);
  }

  async assignPermissions(roleId: number, menuIds: number[]): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['menus'] });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const menus = await this.menuRepository.findBy({ id: In(menuIds) });
    role.menus = menus;
    return this.roleRepository.save(role);
  }
}
