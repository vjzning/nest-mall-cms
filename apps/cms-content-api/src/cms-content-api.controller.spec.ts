import { Test, TestingModule } from '@nestjs/testing';
import { CmsContentApiController } from './cms-content-api.controller';
import { CmsContentApiService } from './cms-content-api.service';

describe('CmsContentApiController', () => {
  let cmsContentApiController: CmsContentApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CmsContentApiController],
      providers: [CmsContentApiService],
    }).compile();

    cmsContentApiController = app.get<CmsContentApiController>(CmsContentApiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(cmsContentApiController.getHello()).toBe('Hello World!');
    });
  });
});
