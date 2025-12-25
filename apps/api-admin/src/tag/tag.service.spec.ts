import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TagService } from './tag.service';
import { TagEntity } from '@app/db/entities/tag.entity';
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

describe('TagService', () => {
  let service: TagService;
  let tagRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: getRepositoryToken(TagEntity),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    tagRepository = module.get<MockRepository>(getRepositoryToken(TagEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a tag', async () => {
      const dto = { name: 'NestJS' };
      const savedTag = { id: 1, ...dto } as TagEntity;

      tagRepository.create.mockReturnValue(dto);
      tagRepository.save.mockResolvedValue(savedTag);

      const result = await service.create(dto);
      expect(result).toEqual(savedTag);
    });
  });
});
