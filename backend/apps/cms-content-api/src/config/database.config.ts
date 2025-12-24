import { registerAs } from '@nestjs/config';
import { UserEntity } from '@app/db/entities/user.entity';
import { RoleEntity } from '@app/db/entities/role.entity';
import { MenuEntity } from '@app/db/entities/menu.entity';
import { ArticleEntity } from '@app/db/entities/article.entity';
import { CategoryEntity } from '@app/db/entities/category.entity';
import { TagEntity } from '@app/db/entities/tag.entity';
import { CommentEntity } from '@app/db/entities/comment.entity';
import { ResourceEntity } from '@app/db/entities/resource.entity';

export default registerAs('database', () => ({
  type: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root123456',
  database: process.env.CMS_DB_NAME || 'cms_admin',
  entities: [UserEntity, RoleEntity, MenuEntity, ArticleEntity, CategoryEntity, TagEntity, CommentEntity, ResourceEntity],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
}));
