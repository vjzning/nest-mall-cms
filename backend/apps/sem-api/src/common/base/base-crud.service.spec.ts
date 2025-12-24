import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BaseCrudService } from './base-crud.service';
import { LowcodeBlockEntity } from 'apps/sem-api/src/entity/lowcode.block';
import { createTestingModule, cleanupTestData } from '../test/test-utils';

describe('BaseCrudService (Integration)', () => {
  jest.setTimeout(30000);
  let service: BaseCrudService<LowcodeBlockEntity>;
  let repository: Repository<LowcodeBlockEntity>;
  let dataSource: DataSource;
  let testIds: number[] = [];

  beforeAll(async () => {
    const module: TestingModule = await createTestingModule(
      [TypeOrmModule.forFeature([LowcodeBlockEntity])],
      [],
      []
    );

    dataSource = module.get<DataSource>(DataSource);
    repository = dataSource.getRepository(LowcodeBlockEntity);
    service = new BaseCrudService(repository);
  });

  afterAll(async () => {
    // 清理测试数据
    for (const id of testIds) {
      await cleanupTestData(dataSource, LowcodeBlockEntity, { id });
    }
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  describe('create', () => {
    it('should create a new entity', async () => {
      const dto = {
        name: 'Test Block',
        title: 'Test Title',
        screenshot: '',
        schema: { test: 'data' } as unknown as JSON,
      };

      const result = await service.create(dto);
      testIds.push(result.id);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(dto.name);
      expect(result.title).toBe(dto.title);
    });

    it('should handle partial data', async () => {
      const dto = {
        name: 'Minimal Block',
        title: 'Minimal Title',
        screenshot: '',
      };

      const result = await service.create(dto);
      testIds.push(result.id);

      expect(result).toBeDefined();
      expect(result.name).toBe(dto.name);
    });
  });

  describe('findAll', () => {
    beforeAll(async () => {
      // 创建一些测试数据
      for (let i = 0; i < 5; i++) {
        const block = await service.create({
          name: `Block ${i}`,
          title: `Title ${i}`,
          screenshot: '',
        });
        testIds.push(block.id);
      }
    });

    it('should return paginated results', async () => {
      const result = await service.findAll({ page: 1, limit: 3 });

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeLessThanOrEqual(3);
      expect(result.total).toBeGreaterThanOrEqual(5);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(3);
    });

    it('should filter by fields', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 10,
        name: 'Block 1',
      });

      expect(result).toBeDefined();
      if (result.data.length > 0) {
        expect(result.data[0].name).toBe('Block 1');
      }
    });

    it('should sort results', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 10,
        sort: 'id',
        order: 'ASC',
      });

      expect(result).toBeDefined();
      if (result.data.length > 1) {
        for (let i = 0; i < result.data.length - 1; i++) {
          expect(Number(result.data[i].id)).toBeLessThanOrEqual(
            Number(result.data[i + 1].id)
          );
        }
      }
    });

    it('should handle empty filters', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 10,
        name: '',
        title: null,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
    });
  });

  describe('findOne', () => {
    it('should find entity by id', async () => {
      const created = await service.create({
        name: 'Find Me',
        title: 'Test',
        screenshot: '',
      });
      testIds.push(created.id);

      const result = await service.findOne(created.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.name).toBe('Find Me');
    });

    it('should return null for non-existent id', async () => {
      const result = await service.findOne(999999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an entity', async () => {
      const created = await service.create({
        name: 'Original Name',
        title: 'Original Title',
        screenshot: '',
      });
      testIds.push(created.id);

      const updated = await service.update(created.id, {
        name: 'Updated Name',
        title: 'Updated Title',
      });

      expect(updated).toBeDefined();
      expect(updated.name).toBe('Updated Name');
      expect(updated.title).toBe('Updated Title');
    });

    it('should handle partial updates', async () => {
      const created = await service.create({
        name: 'Original Name',
        title: 'Original Title',
        screenshot: '',
      });
      testIds.push(created.id);

      const updated = await service.update(created.id, {
        name: 'Only Name Updated',
      });

      expect(updated).toBeDefined();
      expect(updated.name).toBe('Only Name Updated');
      expect(updated.title).toBe('Original Title');
    });
  });

  describe('delete', () => {
    it('should hard delete an entity', async () => {
      const created = await service.create({
        name: 'To Delete',
        title: 'Will be deleted',
        screenshot: '',
      });

      await service.delete(created.id);

      const deleted = await service.findOne(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should soft delete an entity', async () => {
      const created = await service.create({
        name: 'To Soft Delete',
        title: 'Will be soft deleted',
        screenshot: '',
      });
      testIds.push(created.id);

      await service.softDelete(created.id);

      const softDeleted = await service.findOne(created.id);
      expect(softDeleted).toBeDefined();
      expect(softDeleted.isDel).toBe(true);
    });
  });

  describe('repo getter', () => {
    it('should expose repository for custom queries', () => {
      const repo = service.repo;
      expect(repo).toBeDefined();
      expect(repo).toBeInstanceOf(Repository);
    });
  });
});
