import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserEntity } from '@app/db/entities/user.entity';
import { RoleEntity } from '@app/db/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { username }, relations: ['roles'] });
  }

  async findOne(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id }, relations: ['roles'] });
  }

  /**
   * 查询用户及其完整的角色和菜单权限信息
   */
  async findUserWithPermissions(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.menus'],
    });
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { roleIds, ...userData } = createUserDto;
    const user = this.userRepository.create(userData);

    if (roleIds && roleIds.length > 0) {
      const roles = await this.roleRepository.findBy({ id: In(roleIds) });
      user.roles = roles;
    }

    return this.userRepository.save(user);
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find({ relations: ['roles'] });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { roleIds, ...userData } = updateUserDto;
    Object.assign(user, userData);

    if (roleIds) {
      const roles = await this.roleRepository.findBy({ id: In(roleIds) });
      user.roles = roles;
    }

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
