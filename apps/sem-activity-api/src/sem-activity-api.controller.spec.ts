import { Test, TestingModule } from '@nestjs/testing';
import { SemActivityApiController } from './sem-activity-api.controller';
import { SemActivityApiService } from './sem-activity-api.service';

describe('SemActivityApiController', () => {
  let semActivityApiController: SemActivityApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SemActivityApiController],
      providers: [SemActivityApiService],
    }).compile();

    semActivityApiController = app.get<SemActivityApiController>(SemActivityApiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(semActivityApiController.getHello()).toBe('Hello World!');
    });
  });
});
