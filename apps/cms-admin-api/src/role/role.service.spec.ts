import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoleService } from './role.service';
import { RoleEntity } from '@app/db/entities/role.entity';
import { MenuEntity } from '@app/db/entities/menu.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findBy: jest.fn(),
});

describe('RoleService', () => {
  let service: RoleService;
  let roleRepository: MockRepository;
  let menuRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(MenuEntity),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleRepository = module.get<MockRepository>(getRepositoryToken(RoleEntity));
    menuRepository = module.get<MockRepository>(getRepositoryToken(MenuEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a role', async () => {
      const dto = { name: 'Admin', code: 'ADMIN' };
      const savedRole = { id: 1, ...dto } as RoleEntity;

      roleRepository.create.mockReturnValue(dto);
      roleRepository.save.mockResolvedValue(savedRole);

      const result = await service.create(dto);
      expect(result).toEqual(savedRole);
      expect(roleRepository.create).toHaveBeenCalledWith(dto);
      expect(roleRepository.save).toHaveBeenCalledWith(dto);
    });
  });

  describe('assignPermissions', () => {
    it('should assign menus to a role', async () => {
      const roleId = 1;
      const menuIds = [1, 2];
      const role = { id: roleId, menus: [] } as RoleEntity;
      const menus = [{ id: 1 }, { id: 2 }] as MenuEntity[];

      roleRepository.findOne.mockResolvedValue(role);
      menuRepository.findBy.mockResolvedValue(menus);
      roleRepository.save.mockResolvedValue({ ...role, menus });

      const result = await service.assignPermissions(roleId, menuIds);
      expect(result.menus).toEqual(menus);
      expect(roleRepository.findOne).toHaveBeenCalledWith({ where: { id: roleId }, relations: ['menus'] });
      expect(menuRepository.findBy).toHaveBeenCalled();
      expect(roleRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if role not found', async () => {
      roleRepository.findOne.mockResolvedValue(null);
      await expect(service.assignPermissions(99, [1])).rejects.toThrow(NotFoundException);
    });
  });
});
