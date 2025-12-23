import { HttpException, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorCode } from 'apps/sem-api/src/common/constants/error';
import {
  AccessType,
  SuperAdmin,
  UserStatus,
} from 'apps/sem-api/src/common/enum';
import { MyHttpException } from 'apps/sem-api/src/common/exception/my.http.exception';
import { Utils } from 'apps/sem-api/src/common/utils/utils';
import { AccessEntity } from 'apps/sem-api/src/entity/access.entity';
import { RoleEntity } from 'apps/sem-api/src/entity/role.entity';
import { UserEntity } from 'apps/sem-api/src/entity/user.entity';
import { flattenDeep, uniqBy } from 'lodash';
import { DataSource, FindOneOptions, In, Repository } from 'typeorm';
import {
  AllotRoleApiDto,
  CreateAccessDto,
  CreateAccountDto,
  CreateRoleDto,
  LoginDto,
  ResUserListDto,
  UpdateAccountBaseDto,
  UpdateAccountDto,
  UpdateAccountPasswordDto,
  UpdateRoleDto,
  UpdateStatus,
} from './dto';

@Injectable()
export class AccountService {
  constructor(
    private utils: Utils,
    @InjectRepository(UserEntity)
    private readonly accountRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(AccessEntity)
    private readonly accessRepository: Repository<AccessEntity>,
    private dataSource: DataSource
  ) { }
  async createAccount(dto: CreateAccountDto) {
    try {
      const user = this.accountRepository.create(dto);
      return await this.accountRepository.save(user);
    } catch (error) {
      throw new MyHttpException({
        statusCode: ErrorCode.ParamsError.CODE,
      });
    }
  }

  async updateRoleAccount(dto: UpdateAccountDto) {
    return this.dataSource.transaction(async (tManager) => {
      const userRepository = tManager.getRepository(UserEntity);
      const user = await userRepository.findOne({
        where: { id: dto.id },
        relations: ['roles'],
      });
      const { roles, ...dtoUser } = dto;
      const userObj = userRepository.create(dtoUser);
      await userRepository.save(userObj);
      if (roles) {
        await userRepository
          .createQueryBuilder()
          .relation('roles')
          .of(dto.id)
          .remove(user.roles);
        await userRepository
          .createQueryBuilder()
          .relation('roles')
          .of(dto.id)
          .add(roles);
      }
    });
  }
  async updateAccountBaesInfo(dto: UpdateAccountBaseDto) {
    return this.accountRepository.update(dto.id, dto);
  }
  async updateAccountPasword(currentUser: any, dto: UpdateAccountPasswordDto) {
    if (dto.newPassword1 != dto.newPassword2) {
      throw new MyHttpException({ statusCode: ErrorCode.PASSWORDNEQ.CODE });
    }
    const info = await this.accountRepository.findOne({
      where: { id: currentUser.id },
      select: ['password'],
    });
    console.log(info);
    const checkRet = await this.utils.checkPassword(
      dto.oldPassword,
      info.password
    );
    if (!checkRet) {
      throw new MyHttpException({ statusCode: ErrorCode.LoginError.CODE });
    }
    const user = new UserEntity();
    user.password = dto.newPassword2;
    user.id = currentUser.id;
    await this.accountRepository.save(user);
    return true;
    // return this.accountRepository.update(dto.id, {password: dto.newPassword2});
  }
  async deleteAccount(id) {
    const info = await this.accountRepository.findOne({ where: { id } });
    if (info.is_super == SuperAdmin.Yes) {
      throw new MyHttpException({
        statusCode: ErrorCode.Forbidden.CODE,
      });
    }
    return this.accountRepository.delete(id);
  }
  async findOneAccount(options) {
    const findRet = await this.accountRepository
      .createQueryBuilder('user')
      .select('*')
      .addSelect('password')
      .limit(1)
      .where(options)
      .getRawOne();
    return findRet;
  }
  /**
   * 获取用户列表
   */
  async getAccountList(page = 1, pageSize = 10) {
    const [list, count] = await this.accountRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('user.id', 'DESC')
      .getManyAndCount();
    return {
      list,
      count,
      page,
      pageSize,
    };
  }

  async updateAccountStatus(dto: UpdateStatus) {
    return this.accountRepository.update(dto.id, { status: dto.status });
  }

  //创建角色
  async createRole(dto: CreateRoleDto) {
    const role = this.roleRepository.create(dto);
    return this.roleRepository.save(role);
  }

  async deleteRole(id) {
    return this.roleRepository.delete(id);
  }

  async updateRole(dto: UpdateRoleDto) {
    const entiry = this.roleRepository.create(dto);
    return this.roleRepository.save(entiry);
  }
  async findRoleById(id: string) {
    return await this.roleRepository.findOne({ where: { id: +id } });
  }
  /**
   * 获取角色列表
   */
  async getRoleList(qs) {
    return this.roleRepository.find({
      relations: ['access'],
      order: { id: 'DESC' },
    });
  }
  async getAllRoles() {
    return this.roleRepository.find({
      order: { id: 'DESC' },
      select: ['id', 'name'],
    });
  }
  async getUserRoleApiAccess(userId) {
    const qb = this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.users', 'user')
      .leftJoinAndSelect('role.access', 'access')
      .where(`access.type in(${AccessType.Api})`)
      .andWhere(`user.id = :userId`, { userId })
      .select('access.*')
      .addOrderBy('access.sort', 'ASC');
    return await qb.getRawMany();
  }
  async getRoutersApi() {
    return this.accessRepository.find({
      where: {
        type: AccessType.Api,
      },
    });
  }
  /**
   *
   * @param userId 根据 userid 获取菜单模块
   */
  async getMenuList(userId: number) {
    const user: UserEntity = await this.accountRepository.findOne({ where: { id: userId } });
    if (!user) return [];
    if (user.is_super == SuperAdmin.Yes) {
      const accessList = await this.accessRepository.find({
        where: [{ type: AccessType.Module }, { type: AccessType.Menus }],
        order: {
          sort: 'ASC',
        },
      });
      return this.utils.arrToTree(accessList);
    } else {
      const userInfo = await this.accountRepository.findOne({
        where: { id: userId },
        relations: ['roles'],
      });
      if (userInfo && userInfo.roles.length) {
        const rolesIds = userInfo.roles.map((i) => i.id).join(',');
        const roleInfo = await this.roleRepository
          .createQueryBuilder('role')
          .leftJoinAndSelect('role.access', 'access')
          .where(
            `access.type in(${AccessType.Module},${AccessType.Menus}) and role.id in (${rolesIds})`
          )
          .addOrderBy('access.sort', 'ASC')
          .getMany();
        // return this.utils.arrToTree(roleInfo)
        const accessAll = roleInfo.map((i) => i.access);
        return this.utils.arrToTree(flattenDeep(uniqBy(accessAll, 'id')));
      } else {
        return [];
      }
    }
  }
  /**
   * 创建模块菜单。
   */
  async createAccess(dto: CreateAccessDto) {
    const access = this.accessRepository.create(dto);
    return this.accessRepository.save(access);
  }

  async getAllAccess() {
    const result = await this.accessRepository.find({
      // type: In([AccessType.Menus, AccessType.Module]),
    });
    return this.utils.arrToTree(result);
  }
  async login(dto: LoginDto) {
    const user = await this.accountRepository
      .createQueryBuilder()
      .where('username=:username', { username: dto.username })
      .addSelect('password')
      .getOne();
    if (!user)
      throw new MyHttpException({ statusCode: ErrorCode.UserNoExists.CODE });
    const checkRet = this.utils.checkPassword(dto.password, user.password);
    if (!checkRet) {
      throw new MyHttpException({ statusCode: ErrorCode.LoginError.CODE });
    }
  }
  /**
   * 给角色分配接口权限
   */
  async allotApi(dto: AllotRoleApiDto) {
    if (dto?.roleId) {
      const srcRuleEntity = await this.roleRepository
        .createQueryBuilder('role')
        .leftJoinAndSelect(
          'role.access',
          'access',
          `access.type in (${AccessType.Api})`
        )
        .where('role.id=:roleId', { roleId: dto.roleId })
        .getOne();
      await this.roleRepository
        .createQueryBuilder()
        .relation('access')
        .of(dto.roleId)
        .remove(srcRuleEntity.access);
      for (const id of dto.routers) {
        await this.roleRepository
          .createQueryBuilder()
          .relation('access')
          .of(dto.roleId)
          .add(id);
      }
    }
  }
}
