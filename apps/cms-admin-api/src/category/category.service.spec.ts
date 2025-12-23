import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { CategoryEntity } from '@app/db/entities/category.entity';
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

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get<MockRepository>(getRepositoryToken(CategoryEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const dto = { name: 'Tech', slug: 'tech' };
      const savedCategory = { id: 1, ...dto } as CategoryEntity;

      categoryRepository.create.mockReturnValue(dto);
      categoryRepository.save.mockResolvedValue(savedCategory);

      const result = await service.create(dto);
      expect(result).toEqual(savedCategory);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const categories = [{ id: 1, name: 'Tech' }] as CategoryEntity[];
      categoryRepository.find.mockResolvedValue(categories);

      const result = await service.findAll();
      expect(result).toEqual(categories);
    });
  });
});
