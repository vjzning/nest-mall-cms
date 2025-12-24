import { Test, TestingModule } from '@nestjs/testing';
import { CmsAdminApiController } from './cms-admin-api.controller';
import { CmsAdminApiService } from './cms-admin-api.service';

describe('CmsAdminApiController', () => {
  let cmsAdminApiController: CmsAdminApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CmsAdminApiController],
      providers: [CmsAdminApiService],
    }).compile();

    cmsAdminApiController = app.get<CmsAdminApiController>(CmsAdminApiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(cmsAdminApiController.getHello()).toBe('Hello World!');
    });
  });
});
