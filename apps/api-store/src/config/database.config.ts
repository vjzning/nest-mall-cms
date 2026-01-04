import { registerAs } from '@nestjs/config';
import { ALL_ENTITIES } from '@app/db';

export default registerAs('database', () => ({
    type: 'mysql',
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root123456',
    database: process.env.CMS_DB_NAME || 'cms_admin',
    entities: ALL_ENTITIES,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: false,
}));
