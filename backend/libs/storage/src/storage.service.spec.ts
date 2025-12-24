import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StorageService } from './storage.service';
import { ResourceEntity } from '@app/db/entities/resource.entity';
import { UserEntity } from '@app/db/entities/user.entity';
import { Repository } from 'typeorm';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
});

describe('StorageService', () => {
  let service: StorageService;
  let resourceRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: getRepositoryToken(ResourceEntity),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    resourceRepository = module.get<MockRepository>(getRepositoryToken(ResourceEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('should upload a file and save resource', async () => {
      const file = {
        originalname: 'test.jpg',
        filename: 'uuid.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('test'),
      } as Express.Multer.File;
      const user = { id: 1 } as UserEntity;

      // Mock LocalStorageDriver.put since it's instantiated in constructor
      // A better approach would be to inject the driver, but for now we mock the result
      jest.spyOn(service['driver'], 'put').mockResolvedValue({
        url: '/uploads/uuid.jpg',
        path: 'uploads/uuid.jpg',
      });

      const resourceData = {
        originalName: file.originalname,
        filename: 'uuid.jpg',
        path: 'uploads/uuid.jpg',
        url: '/uploads/uuid.jpg',
        mimeType: file.mimetype,
        size: file.size,
        driver: 'local',
        uploader: user,
      };

      resourceRepository.create.mockReturnValue(resourceData);
      resourceRepository.save.mockResolvedValue({ id: 1, ...resourceData });

      const result = await service.upload(file, user);
      expect(result).toEqual({ id: 1, ...resourceData });
      expect(resourceRepository.create).toHaveBeenCalled();
      expect(resourceRepository.save).toHaveBeenCalled();
    });
  });
});
