import { Test, TestingModule } from '@nestjs/testing';
import { SemApiController } from './sem-api.controller';
import { SemApiService } from './sem-api.service';
import { RedisLockService } from './modules/redisLock/redisLock.service';

describe('SemApiController', () => {
  let semApiController: SemApiController;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SemApiController],
      providers: [
        {
          provide: SemApiService,
          useValue: {
            getHello: () => 'Hello World!',
          },
        },
        {
          provide: RedisLockService,
          useValue: {
            lockOnce: jest.fn(),
            lock: jest.fn(),
          },
        },
      ],
    }).compile();
    semApiController = app.get<SemApiController>(SemApiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', async () => {
      // console.log(semApiController, 111);
      expect(semApiController.getHello()).toContain('Hello World!');
    });
  });

  describe('activity', () => {
    it('should return "Hello World!"', async () => {
      // console.log(semApiController, 111);
      // const info = await activityService.getInfo('battle_20240813_ts');
      // expect(info.uniqueCode).toContain('battle_20240813_ts');
      // expect(activityService.getInfo('magic_20220803')).toContain('magic_20220803');
    });
  });
});
