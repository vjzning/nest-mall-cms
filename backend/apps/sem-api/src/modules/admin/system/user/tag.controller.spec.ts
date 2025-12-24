import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserTagRuleController, UserTagRuleService } from './tag.controller';
import { TagRuleEntity } from 'apps/sem-api/src/entity/tag.rule.entity';
import { createTestingModule, cleanupTestData, createTestData } from 'apps/sem-api/src/common/test/test-utils';

describe('UserTagRuleController (Integration)', () => {
  jest.setTimeout(30000);
  let controller: UserTagRuleController;
  let service: UserTagRuleService;
  let dataSource: DataSource;
  let testTagIds: number[] = [];

  beforeAll(async () => {
    const module: TestingModule = await createTestingModule(
      [TypeOrmModule.forFeature([TagRuleEntity])],
      [UserTagRuleService],
      [UserTagRuleController]
    );

    controller = module.get<UserTagRuleController>(UserTagRuleController);
    service = module.get<UserTagRuleService>(UserTagRuleService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    // 清理测试数据
    for (const id of testTagIds) {
      await cleanupTestData(dataSource, TagRuleEntity, { id });
    }
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('createOne', () => {
    it('should create a new tag rule', async () => {
      const createDto = {
        title: 'VIP用户',
        name: 'VIP用户',
        remark: '高价值用户标签',
        ruleConfig: JSON.stringify({ minAmount: 1000 }),
      };

      const result = await controller.createOne(createDto);
      testTagIds.push(result.id);

      expect(result).toBeDefined();
      expect(result.title).toBe(createDto.title);
      expect(result.name).toBe(createDto.name);
      expect(result.remark).toBe(createDto.remark);
      expect(result.ruleConfig).toBe(createDto.ruleConfig);
      expect(result.isDel).toBe(false);
    });

    it('should create tag with custom rules', async () => {
      const createDto = {
        title: '活跃用户',
        name: '活跃用户',
        remark: '最近30天活跃',
        ruleConfig: JSON.stringify({
          loginDays: 30,
          minOrders: 5,
        }),
      };

      const result = await controller.createOne(createDto);
      testTagIds.push(result.id);

      expect(result).toBeDefined();
      expect(JSON.parse(result.ruleConfig || '{}')).toEqual(
        JSON.parse(createDto.ruleConfig)
      );
    });
  });

  describe('getMany', () => {
    it('should return paginated list of tag rules', async () => {
      const query = { page: 1, limit: 10 };
      const result = await controller.getMany(query);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should filter tags by name', async () => {
      const query = { page: 1, limit: 10, name: 'VIP' };
      const result = await controller.getMany(query);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
    });

    it('should exclude deleted tags by default', async () => {
      const query = { page: 1, limit: 10, isDel: false };
      const result = await controller.getMany(query);

      expect(result).toBeDefined();
      result.data.forEach(tag => {
        expect(tag.isDel).toBe(false);
      });
    });
  });

  describe('getOne', () => {
    it('should return a specific tag rule', async () => {
      const testTag = await createTestData(dataSource, TagRuleEntity, {
        title: 'Test Tag',
        name: 'Test Tag',
        remark: 'For testing',
        ruleConfig: JSON.stringify({ test: true }),
      });
      testTagIds.push(testTag.id);

      const result = await controller.getOne(testTag.id.toString());

      expect(result).toBeDefined();
      expect(result.id).toBe(testTag.id);
      expect(result.name).toBe('Test Tag');
    });

    it('should return null for non-existent tag', async () => {
      const result = await controller.getOne('999999');
      expect(result).toBeNull();
    });
  });

  describe('deleteOne (soft delete)', () => {
    it('should soft delete a tag rule', async () => {
      const testTag = await createTestData(dataSource, TagRuleEntity, {
        title: 'Tag to Delete',
        name: 'Tag to Delete',
        remark: 'Will be soft deleted',
        ruleConfig: JSON.stringify({ delete: true }),
      });
      testTagIds.push(testTag.id);

      const result = await controller.deleteOne(testTag.id.toString());
      expect(result.success).toBe(true);

      // 验证软删除
      const deleted = await service.findOne(testTag.id);
      expect(deleted).toBeDefined();
      expect(deleted.isDel).toBe(true);
    });
  });
});
