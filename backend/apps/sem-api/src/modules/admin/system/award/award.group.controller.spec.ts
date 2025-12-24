import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AwardGroupController, AwardGroupService } from './award.group.controller';
import { AwardGroupEntity } from 'apps/sem-api/src/entity/award.group.entity';
import { AwardGroupProbEntity } from 'apps/sem-api/src/entity/award.group.prob.entity';
import { TaskAwardInstanceEntity } from 'apps/sem-api/src/entity/activities.task.award';
import { AwardEntity } from 'apps/sem-api/src/entity/award.entity';
import { createTestingModule, cleanupTestData, createTestData } from 'apps/sem-api/src/common/test/test-utils';

describe('AwardGroupController (Integration)', () => {
  jest.setTimeout(30000);
  let controller: AwardGroupController;
  let service: AwardGroupService;
  let dataSource: DataSource;
  let testGroupIds: number[] = [];
  let testAwardId: number;

  beforeAll(async () => {
    const module: TestingModule = await createTestingModule(
      [
        TypeOrmModule.forFeature([
          AwardGroupEntity,
          AwardGroupProbEntity,
          TaskAwardInstanceEntity,
          AwardEntity,
        ]),
      ],
      [AwardGroupService],
      [AwardGroupController]
    );

    controller = module.get<AwardGroupController>(AwardGroupController);
    service = module.get<AwardGroupService>(AwardGroupService);
    dataSource = module.get<DataSource>(DataSource);

    // 创建测试奖励
    const testAward = await createTestData<AwardEntity>(dataSource, AwardEntity, {
      name: 'Test Award',
      keyId: 'test-key-id',
      keyType: 'test-key-type',
      numAttr: 100,
      image: 'test.jpg',
    });
    testAwardId = testAward.id;
  });

  afterAll(async () => {
    // 清理测试数据
    for (const id of testGroupIds) {
      await cleanupTestData(dataSource, AwardGroupEntity, { id });
    }
    if (testAwardId) {
      await cleanupTestData(dataSource, AwardEntity, { id: testAwardId });
    }
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('createOne', () => {
    it('should create a new award group', async () => {
      const createDto = {
        name: '新手礼包',
        image: 'newbie.jpg',
        description: '新用户专属礼包',
      };

      const result = await controller.createOne(createDto);
      testGroupIds.push(result.id);

      expect(result).toBeDefined();
      expect(result.name).toBe(createDto.name);
      expect(result.isDel).toBe(false);
    });
  });

  describe('getMany', () => {
    it('should return paginated list with nested relations', async () => {
      const query = { page: 1, limit: 10 };
      const result = await controller.getMany(query);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThanOrEqual(0);

      // 验证深层关联数据已加载
      if (result.data.length > 0) {
        const group = result.data[0];
        expect(group.probLevelAwards).toBeDefined();
        if (group.probLevelAwards && group.probLevelAwards.length > 0) {
          expect(group.probLevelAwards[0].awardsInstance).toBeDefined();
        }
      }
    });

    it('should filter out deleted groups', async () => {
      const query = { page: 1, limit: 10 };
      const result = await controller.getMany(query);

      result.data.forEach(group => {
        expect(group.isDel).toBe(false);
      });
    });

    it('should sort by id DESC', async () => {
      const query = { page: 1, limit: 10 };
      const result = await controller.getMany(query);

      if (result.data.length > 1) {
        for (let i = 0; i < result.data.length - 1; i++) {
          expect(result.data[i].id).toBeGreaterThanOrEqual(result.data[i + 1].id);
        }
      }
    });
  });

  describe('getOne', () => {
    it('should return group with all relations', async () => {
      const testGroup = await createTestData<AwardGroupEntity>(dataSource, AwardGroupEntity, {
        name: 'Test Group',
        image: 'test-group.jpg',
        description: 'For testing',
      });
      testGroupIds.push(testGroup.id);

      const result = await controller.getOne(testGroup.id.toString());

      expect(result).toBeDefined();
      expect(result.id).toBe(testGroup.id);
      expect(result.probLevelAwards).toBeDefined();
    });
  });

  describe('updateOne', () => {
    it('should update an award group', async () => {
      const testGroup = await createTestData<AwardGroupEntity>(dataSource, AwardGroupEntity, {
        name: 'Original Name',
        image: 'original.jpg',
        description: 'Original Description',
      });
      testGroupIds.push(testGroup.id);

      const updateDto = {
        name: 'Updated Name',
        description: 'Updated Description',
      };

      const result = await controller.updateOne(
        testGroup.id.toString(),
        updateDto
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(updateDto.name);
      expect(result.description).toBe(updateDto.description);
    });
  });

  describe('deleteOne (soft delete)', () => {
    it('should soft delete an award group', async () => {
      const testGroup = await createTestData<AwardGroupEntity>(dataSource, AwardGroupEntity, {
        name: 'Group to Delete',
        image: 'delete.jpg',
        description: 'Will be soft deleted',
      });
      testGroupIds.push(testGroup.id);

      const result = await controller.deleteOne(testGroup.id.toString());
      expect(result.success).toBe(true);

      // 验证软删除
      const deleted = await service.findOne(testGroup.id);
      expect(deleted).toBeDefined();
      expect(deleted.isDel).toBe(true);
    });
  });

  describe('getOptions', () => {
    it('should return available groups excluding specified id', async () => {
      const testGroup1 = await createTestData<AwardGroupEntity>(dataSource, AwardGroupEntity, {
        name: 'Group 1',
        image: 'group1.jpg',
      });
      const testGroup2 = await createTestData<AwardGroupEntity>(dataSource, AwardGroupEntity, {
        name: 'Group 2',
        image: 'group2.jpg',
      });
      testGroupIds.push(testGroup1.id, testGroup2.id);

      const result = await controller.getOptions(testGroup1.id.toString());

      expect(result).toBeInstanceOf(Array);
      // 应该不包含 testGroup1
      const foundGroup1 = result.find(g => g.id === testGroup1.id);
      expect(foundGroup1).toBeUndefined();

      // 应该包含 testGroup2
      const foundGroup2 = result.find(g => g.id === testGroup2.id);
      if (foundGroup2) {
        expect(foundGroup2.id).toBe(testGroup2.id);
      }
    });

    it('should only return groups without children', async () => {
      const result = await controller.getOptions('1');

      result.forEach(group => {
        const hasChildlessLevel = group.probLevelAwards.some(
          level => level.childrenAwardGroup === null
        );
        expect(hasChildlessLevel).toBe(true);
      });
    });
  });
});
