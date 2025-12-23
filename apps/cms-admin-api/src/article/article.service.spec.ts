import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ArticleService } from './article.service';
import { ArticleEntity } from '@app/db/entities/article.entity';
import { TagEntity } from '@app/db/entities/tag.entity';
import { CategoryEntity } from '@app/db/entities/category.entity';
import { UserEntity } from '@app/db/entities/user.entity';
import { Repository } from 'typeorm';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  }),
});

describe('ArticleService', () => {
  let service: ArticleService;
  let articleRepository: MockRepository;
  let categoryRepository: MockRepository;
  let tagRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(ArticleEntity),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(TagEntity),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    articleRepository = module.get<MockRepository>(getRepositoryToken(ArticleEntity));
    categoryRepository = module.get<MockRepository>(getRepositoryToken(CategoryEntity));
    tagRepository = module.get<MockRepository>(getRepositoryToken(TagEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an article with relations', async () => {
      const user = { id: 1 } as UserEntity;
      const dto = { title: 'Test', categoryId: 1, tagIds: [1] };
      const category = { id: 1 } as CategoryEntity;
      const tags = [{ id: 1 }] as TagEntity[];
      const savedArticle = { id: 1, ...dto, author: user, category, tags } as ArticleEntity;

      articleRepository.create.mockReturnValue({ ...dto, author: user });
      categoryRepository.findOne.mockResolvedValue(category);
      tagRepository.findBy.mockResolvedValue(tags);
      articleRepository.save.mockResolvedValue(savedArticle);

      const result = await service.create(dto, user);
      expect(result).toEqual(savedArticle);
      expect(categoryRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(tagRepository.findBy).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated articles', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toEqual([[], 0]);
      expect(articleRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });
});
