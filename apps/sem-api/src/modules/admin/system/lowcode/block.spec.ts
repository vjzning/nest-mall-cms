import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LowCodeBlockController, LowCodeBlockService } from './block';
import { LowcodeBlockEntity } from 'apps/sem-api/src/entity/lowcode.block';
import { createTestingModule, cleanupTestData, createTestData } from 'apps/sem-api/src/common/test/test-utils';

describe('LowCodeBlockController (Integration)', () => {
  jest.setTimeout(30000);
  let controller: LowCodeBlockController;
  let service: LowCodeBlockService;
  let dataSource: DataSource;
  let testBlockId: number;

  beforeAll(async () => {
    const module: TestingModule = await createTestingModule(
      [TypeOrmModule.forFeature([LowcodeBlockEntity])],
      [LowCodeBlockService],
      [LowCodeBlockController]
    );

    controller = module.get<LowCodeBlockController>(LowCodeBlockController);
    service = module.get<LowCodeBlockService>(LowCodeBlockService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    // 清理测试数据
    if (testBlockId) {
      await cleanupTestData(dataSource, LowcodeBlockEntity, { id: testBlockId });
    }
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('createOne', () => {
    it('should create a new block', async () => {
      const createDto = {
        name: 'Test Block',
        title: 'Test Title',
        screenshot: '',
        schema: { test: 'data' } as unknown as JSON,
      };

      const result = await controller.createOne(createDto);
      testBlockId = result.id;

      expect(result).toBeDefined();
      expect(result.name).toBe(createDto.name);
    });
  });

  describe('getMany', () => {
    it('should return paginated list of blocks', async () => {
      const query = { page: 1, limit: 10 };
      const result = await controller.getMany(query);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should filter blocks by name', async () => {
      const query = { page: 1, limit: 10, name: 'Test Block' };
      const result = await controller.getMany(query);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      if (result.data.length > 0) {
        expect(result.data[0].name).toContain('Test');
      }
    });
  });

  describe('deleteOne', () => {
    it('should delete a block', async () => {
      // 先创建一个测试数据
      const testBlock = await createTestData<LowcodeBlockEntity>(dataSource, LowcodeBlockEntity, {
        name: 'Block to Delete',
        title: 'Delete Title',
        screenshot: '',
      });

      const result = await controller.deleteOne(testBlock.id.toString());
      expect(result.success).toBe(true);

      // 验证已删除
      const deleted = await service.findOne(testBlock.id);
      expect(deleted).toBeNull();
    });
  });
});
