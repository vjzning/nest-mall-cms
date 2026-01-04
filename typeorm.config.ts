import { DataSource } from 'typeorm';
import { ALL_ENTITIES } from './packages/db/src';

// 如果你需要从 .env 文件加载，可以使用 typeorm-ts-node-commonjs 运行前先加载环境变量
// 或者在这里手动处理简单的环境变量加载

export default new DataSource({
    type: 'mysql',
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root123456',
    database: process.env.CMS_DB_NAME || 'cms_admin',
    entities: ALL_ENTITIES,
    migrations: ['migrations/*.ts'],
    synchronize: false, // 迁移工具永远设置为 false
});
