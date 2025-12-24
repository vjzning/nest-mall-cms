import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { MenuEntity } from '@app/db/entities/menu.entity';
import { Repository } from 'typeorm';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('MenuService', () => {
  let service: MenuService;
  let menuRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: getRepositoryToken(MenuEntity),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    menuRepository = module.get<MockRepository>(getRepositoryToken(MenuEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of menus', async () => {
      const menus = [{ id: 1, name: 'Dashboard' }] as MenuEntity[];
      menuRepository.find.mockResolvedValue(menus);

      const result = await service.findAll();
      expect(result).toEqual(menus);
      expect(menuRepository.find).toHaveBeenCalledWith({ order: { sort: 'ASC' } });
    });
  });

  describe('create', () => {
    it('should create a menu', async () => {
      const dto = { name: 'Dashboard' };
      const savedMenu = { id: 1, ...dto } as MenuEntity;

      menuRepository.create.mockReturnValue(dto);
      menuRepository.save.mockResolvedValue(savedMenu);

      const result = await service.create(dto);
      expect(result).toEqual(savedMenu);
    });
  });
});
