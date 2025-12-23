import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import entities from '../../entity';

/**
 * 创建测试模块的辅助函数
 * 连接真实数据库进行集成测试
 */
export async function createTestingModule(
  imports: any[] = [],
  providers: any[] = [],
  controllers: any[] = []
): Promise<TestingModule> {
  const module = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: ['.env.test', '.env'],
      }),
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          type: 'mysql',
          host: configService.get('DB_HOST', 'localhost'),
          port: Number(configService.get('DB_PORT', 3306)),
          username: configService.get('DB_USERNAME', 'root'),
          password: configService.get('DB_PASSWORD', ''),
          database: configService.get('DB_DATABASE_TEST', 'test_db'),
          entities,
          synchronize: false,
          migrationsRun: false,
          logging: false,
          retryAttempts: 0,
          retryDelay: 0,
        }),
        inject: [ConfigService],
      }),
      ...imports,
    ],
    providers,
    controllers,
  }).compile();

  return module;
}

/**
 * 清理测试数据的辅助函数
 */
export async function cleanupTestData<T>(
  dataSource: DataSource,
  entity: new () => T,
  condition?: any
) {
  const repository = dataSource.getRepository(entity);
  if (condition) {
    await repository.delete(condition);
  } else {
    // 清空表但保留结构
    await repository.clear();
  }
}

/**
 * 创建测试数据的辅助函数
 */
export async function createTestData<T>(
  dataSource: DataSource,
  entity: new () => T,
  data: Partial<T>
): Promise<T> {
  const repository = dataSource.getRepository(entity);
  const instance = repository.create(data as any);
  return repository.save(instance) as Promise<T>;
}

/**
 * 测试数据库连接
 */
export async function testDatabaseConnection(dataSource: DataSource): Promise<boolean> {
  try {
    await dataSource.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
