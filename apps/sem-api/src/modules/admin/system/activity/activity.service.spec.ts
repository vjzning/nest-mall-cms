
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';

import { ActivityService } from './activity.service';
import { Utils } from 'apps/sem-api/src/common/utils/utils';
import { FunctionsTarget } from 'apps/sem-api/src/common/utils/function_target';
import { AwardService } from '../award/award.service';
import { RedisLockService } from '@app/sem-api/modules/redisLock/redisLock.service';

import { ActivityEntity } from 'apps/sem-api/src/entity/activities.entity';
import { ActivityTaskEntity } from 'apps/sem-api/src/entity/activities.task.entity';
import { BusinessTargetEntity } from 'apps/sem-api/src/entity/business.arget.entity';
import { AwardCheckInfoEntity } from 'apps/sem-api/src/entity/award.check';
import { CompleteTaskUserEntity } from 'apps/sem-api/src/entity/complete.task.user.entity';
import { AwardGroupEntity } from 'apps/sem-api/src/entity/award.group.entity';
import { AwardEntity } from 'apps/sem-api/src/entity/award.entity';
import { CategoryAwardEntity } from 'apps/sem-api/src/entity/category.award.entity';

jest.mock('axios-retry', () => jest.fn());

describe('ActivityService', () => {
  let module: TestingModule;
  let service: ActivityService;

  let activityTaskRepository: Repository<ActivityTaskEntity>;
  let activityRepository: Repository<ActivityEntity>;
  let redisLock: RedisLockService;
  let cacheManager: any;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: Utils,
          useValue: {
            getActInfoCacheKey: jest.fn((id: any) => `cache:actInfo:${id}`),
          },
        },
        {
          provide: FunctionsTarget,
          useValue: {},
        },
        {
          provide: HttpService,
          useValue: {
            axiosRef: {},
          },
        },
        {
          provide: AwardService,
          useValue: {
            sendAward: jest.fn(),
          },
        },
        {
          provide: getQueueToken('activity'),
          useValue: {
            add: jest.fn(),
            getJob: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ActivityEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ActivityTaskEntity),
          useValue: {
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BusinessTargetEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(AwardCheckInfoEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CompleteTaskUserEntity),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AwardGroupEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AwardEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CategoryAwardEntity),
          useValue: {},
        },
        {
          provide: RedisLockService,
          useValue: {
            lockOnce: jest.fn(),
            lock: jest.fn(),
            unlock: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            wrap: jest.fn(),
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ActivityService);
    activityTaskRepository = module.get(getRepositoryToken(ActivityTaskEntity));
    activityRepository = module.get(getRepositoryToken(ActivityEntity));
    redisLock = module.get(RedisLockService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getActivityTaskList', () => {
    it('should call repository.find with cache and where', async () => {
      const where = { id: 1 };
      (activityTaskRepository.find as any).mockResolvedValue([]);

      await service.getActivityTaskList(where);

      expect(activityTaskRepository.find).toHaveBeenCalledWith({
        cache: true,
        where,
      });
    });
  });

  describe('getInfo', () => {
    it('should use cacheManager.wrap with key and fallback loader', async () => {
      const fake = { id: 1, end_time: new Date().toISOString() } as any;
      const spy = jest
        .spyOn(service as any, 'getActivityInfo')
        .mockResolvedValue(fake);

      cacheManager.wrap.mockImplementation(async (_key, fn) => fn());

      const result = await service.getInfo('code_1');

      expect(cacheManager.wrap).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith('code_1');
      expect(result).toBe(fake);
    });
  });

  describe('handleCronByHour', () => {
    it('should short-circuit when lock is not acquired', async () => {
      (redisLock.lockOnce as any).mockResolvedValue(false);

      await service.handleCronByHour();

      expect(activityTaskRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('handleCronByDay', () => {
    it('should short-circuit when lock is not acquired', async () => {
      (redisLock.lockOnce as any).mockResolvedValue(false);
      (activityRepository.createQueryBuilder as any).mockImplementation(() => {
        return {
          where: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([]),
        };
      });

      await service.handleCronByDay();

      expect(activityRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });
});

