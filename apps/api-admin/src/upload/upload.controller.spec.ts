import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { StorageService } from '@app/storage';

describe('UploadController', () => {
  let controller: UploadController;
  let storageService: Partial<Record<keyof StorageService, jest.Mock>>;

  beforeEach(async () => {
    storageService = {
      upload: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: StorageService,
          useValue: storageService,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
