import { registerAs } from '@nestjs/config';
import { UserEntity } from '@app/db/entities/user.entity';
import { RoleEntity } from '@app/db/entities/role.entity';
import { MenuEntity } from '@app/db/entities/menu.entity';
import { ArticleEntity } from '@app/db/entities/article.entity';
import { CategoryEntity } from '@app/db/entities/category.entity';
import { TagEntity } from '@app/db/entities/tag.entity';
import { CommentEntity } from '@app/db/entities/comment.entity';
import { ResourceEntity } from '@app/db/entities/resource.entity';
import { MemberEntity } from '@app/db/entities/member.entity';
import { MallProductEntity } from '@app/db/entities/mall-product.entity';
import { MallProductSkuEntity } from '@app/db/entities/mall-product-sku.entity';
import { MallOrderEntity } from '@app/db/entities/mall-order.entity';
import { MallOrderItemEntity } from '@app/db/entities/mall-order-item.entity';
import { MallPaymentEntity } from '@app/db/entities/mall-payment.entity';
import { SystemConfigEntity } from '@app/db/entities/system-config.entity';

export default registerAs('database', () => ({
  type: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root123456',
  database: process.env.CMS_DB_NAME || 'cms_admin',
  entities: [
    UserEntity,
    RoleEntity,
    MenuEntity,
    ArticleEntity,
    CategoryEntity,
    TagEntity,
    CommentEntity,
    ResourceEntity,
    MemberEntity,
    MallProductEntity,
    MallProductSkuEntity,
    MallOrderEntity,
    MallOrderItemEntity,
    MallPaymentEntity,
    SystemConfigEntity,
  ],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
}));
