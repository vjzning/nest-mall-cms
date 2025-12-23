import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpService } from '@nestjs/axios';
import { DataSource } from 'typeorm';
import { UserTagMapController, UserTagMapService } from './user.tag.controller';
import { UserTagEntity } from 'apps/sem-api/src/entity/tag.rule.user.entity';
import { TagRuleEntity } from 'apps/sem-api/src/entity/tag.rule.entity';
import { BusinessBaseUserEntity } from 'apps/sem-api/src/entity/business.user.entity';
import { Utils } from 'apps/sem-api/src/common/utils/utils';
import { createTestingModule, cleanupTestData, createTestData } from 'apps/sem-api/src/common/test/test-utils';
import { RedisClientService } from 'apps/sem-api/src/modules/redisClient/redisClient.service';

describe('UserTagMapController (Integration)', () => {
  jest.setTimeout(30000);
  let controller: UserTagMapController;
  let service: UserTagMapService;
  let dataSource: DataSource;
  let utils: Utils;
  let cacheManager: any;
  let testMapIds: number[] = [];
  let testUserId: number;
  let testTagId: number;

  beforeAll(async () => {
    const module: TestingModule = await createTestingModule(
      [
        TypeOrmModule.forFeature([
          UserTagEntity,
          TagRuleEntity,
          BusinessBaseUserEntity,
        ]),
      ],
      [
        UserTagMapService,
        Utils,
        {
          provide: RedisClientService,
          useValue: {
            getClient: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
            axiosRef: {
              interceptors: {
                request: { use: jest.fn() },
                response: { use: jest.fn() },
              },
            },
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
      [UserTagMapController]
    );

    controller = module.get<UserTagMapController>(UserTagMapController);
    service = module.get<UserTagMapService>(UserTagMapService);
    dataSource = module.get<DataSource>(DataSource);
    utils = module.get<Utils>(Utils);
    cacheManager = module.get(CACHE_MANAGER);

    // 创建测试用户和标签
    const testUser = await createTestData(dataSource, BusinessBaseUserEntity, {
      businessUserId: 123,
      extAttr: {},
      avatar: '',
      nickname: 'Test User',
    });
    testUserId = testUser.id;

    const testTag = await createTestData(dataSource, TagRuleEntity, {
      title: 'Test Tag',
      name: 'Test Tag',
      remark: 'For testing',
      ruleConfig: JSON.stringify({ test: true }),
    });
    testTagId = testTag.id;
  });

  afterAll(async () => {
    // 清理测试数据
    for (const id of testMapIds) {
      await cleanupTestData(dataSource, UserTagEntity, { id });
    }
    if (testUserId) {
      await cleanupTestData(dataSource, BusinessBaseUserEntity, { id: testUserId });
    }
    if (testTagId) {
      await cleanupTestData(dataSource, TagRuleEntity, { id: testTagId });
    }
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('createOne', () => {
    it('should create a user-tag mapping', async () => {
      const now = new Date();
      const createDto = {
        user: {
          id: testUserId,
          businessUserId: 123,
          extAttr: {},
          avatar: '',
          nickname: 'Test User',
        },
        tag: { id: testTagId },
        startTime: now,
        endTime: now,
        status: 1,
      };

      const result = await controller.createOne(createDto as any);
      testMapIds.push(result.id);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.tag).toBeDefined();
    });

    it('should clear cache after creating mapping', async () => {
      const now = new Date();
      const createDto = {
        user: {
          id: testUserId,
          businessUserId: 123,
          extAttr: {},
          avatar: '',
          nickname: 'Test User',
        },
        tag: { id: testTagId },
        startTime: now,
        endTime: now,
        status: 1,
      };

      await controller.createOne(createDto as any);

      // 验证缓存被清除
      expect(cacheManager.del).toHaveBeenCalled();
    });
  });

  describe('getMany', () => {
    it('should return paginated list with relations', async () => {
      const query = { page: 1, limit: 10 };
      const result = await controller.getMany(query);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThanOrEqual(0);

      // 验证关联数据已加载
      if (result.data.length > 0) {
        expect(result.data[0].user).toBeDefined();
        expect(result.data[0].tag).toBeDefined();
      }
    });

    it('should filter by user id', async () => {
      const query = { page: 1, limit: 10, userId: testUserId };
      const result = await controller.getMany(query);

      expect(result).toBeDefined();
      result.data.forEach(mapping => {
        expect(mapping.user.id).toBe(testUserId);
      });
    });
  });

  describe('getOne', () => {
    it('should return mapping with relations', async () => {
      const now = new Date();
      const testMapping = await createTestData(dataSource, UserTagEntity, {
        user: {
          id: testUserId,
          businessUserId: 123,
          extAttr: {},
          avatar: '',
          nickname: 'Test User',
        } as any,
        tag: { id: testTagId } as any,
        startTime: now,
        endTime: now,
        status: 1,
      });
      testMapIds.push(testMapping.id);

      const result = await controller.getOne(testMapping.id.toString());

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.tag).toBeDefined();
    });
  });

  describe('deleteOne', () => {
    it('should delete mapping and clear cache', async () => {
      const now = new Date();
      const testMapping = await createTestData(dataSource, UserTagEntity, {
        user: {
          id: testUserId,
          businessUserId: 123,
          extAttr: {},
          avatar: '',
          nickname: 'Test User',
        } as any,
        tag: { id: testTagId } as any,
        startTime: now,
        endTime: now,
        status: 1,
      });

      const result = await controller.deleteOne(testMapping.id.toString());
      expect(result.success).toBe(true);

      // 验证缓存被清除
      expect(cacheManager.del).toHaveBeenCalled();

      // 验证已删除
      const deleted = await service.findOne(testMapping.id);
      expect(deleted).toBeNull();
    });
  });
});
