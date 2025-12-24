import { registerAs } from '@nestjs/config';
import * as path from 'path';
const dev = process.env.NODE_ENV !== 'production';
console.log('isDev', dev);
export default registerAs('database', async () => {
  return Promise.resolve({
    type: 'mysql',
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || '3306',
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.MYSQL_DB_NAME || 'sem',
    // "entities": [path.resolve(__dirname, '../') + '/**/*.entity{.ts,.js}'],
    entityPrefix: 'sem_',
    autoLoadEntities: true,
    synchronize: false,
    logging: false,
    logger: 'file',
    cache: {
      type: 'redis',
    },
    maxQueryExecutionTime: 1000,
    migrationsRun: true,
    migrationsTableName: 'custom_migration_table',
    migrations: ['migrations/*{.ts,.js}'],
    cli: {
      migrationsDir: 'migrations',
    },
  });
});
