import { UserEntity } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { MenuEntity } from './entities/menu.entity';
import { ArticleEntity } from './entities/article.entity';
import { CategoryEntity } from './entities/category.entity';
import { TagEntity } from './entities/tag.entity';
import { CommentEntity } from './entities/comment.entity';
import { ResourceEntity } from './entities/resource.entity';
import { DictTypeEntity } from './entities/dict-type.entity';
import { DictDataEntity } from './entities/dict-data.entity';
import { SystemConfigEntity } from './entities/system-config.entity';
import { MemberEntity } from './entities/member.entity';
import { MemberFavoriteEntity } from './entities/member-favorite.entity';
import { MallCategoryEntity } from './entities/mall-category.entity';
import { MallProductEntity } from './entities/mall-product.entity';
import { MallProductSkuEntity } from './entities/mall-product-sku.entity';
import { MallOrderEntity } from './entities/mall-order.entity';
import { MallOrderItemEntity } from './entities/mall-order-item.entity';
import { MallPaymentEntity } from './entities/mall-payment.entity';
import { CollectionEntity } from './entities/collection.entity';
import { CollectionItemEntity } from './entities/collection-item.entity';
import { MemberAuthEntity } from './entities/member-auth.entity';
import { MemberAddressEntity } from './entities/member-address.entity';
import { SystemLogEntity } from './entities/system-log.entity';
import { MallShippingTemplateEntity } from './entities/mall-shipping-template.entity';
import { MallShippingRuleEntity } from './entities/mall-shipping-rule.entity';
import { MallShippingFreeRuleEntity } from './entities/mall-shipping-free-rule.entity';
import { RegionEntity } from './entities/region.entity';
import { MallCouponEntity } from './entities/mall-coupon.entity';
import { MallMemberCouponEntity } from './entities/mall-member-coupon.entity';
import { MallAfterSaleEntity } from './entities/mall-after-sale.entity';
import { MallDeliveryEntity } from './entities/mall-delivery.entity';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationTaskEntity } from './entities/notification-task.entity';
import { NotificationSettingEntity } from './entities/notification-setting.entity';
import { FlashSaleActivityEntity } from './entities/flash-sale-activity.entity';
import { FlashSaleProductEntity } from './entities/flash-sale-product.entity';

export * from './db.module';
export * from './db.service';
export * from './entities/base.entity';
export * from './entities/user.entity';
export * from './entities/role.entity';
export * from './entities/menu.entity';
export * from './entities/article.entity';
export * from './entities/category.entity';
export * from './entities/tag.entity';
export * from './entities/comment.entity';
export * from './entities/resource.entity';
export * from './entities/dict-type.entity';
export * from './entities/dict-data.entity';
export * from './entities/system-config.entity';
export * from './entities/member.entity';
export * from './entities/member-favorite.entity';
export * from './entities/mall-category.entity';
export * from './entities/mall-product.entity';
export * from './entities/mall-product-sku.entity';
export * from './entities/mall-order.entity';
export * from './entities/mall-order-item.entity';
export * from './entities/mall-payment.entity';
export * from './entities/collection.entity';
export * from './entities/collection-item.entity';
export * from './entities/member-auth.entity';
export * from './entities/member-address.entity';
export * from './entities/system-log.entity';
export * from './entities/mall-shipping-template.entity';
export * from './entities/mall-shipping-rule.entity';
export * from './entities/mall-shipping-free-rule.entity';
export * from './entities/region.entity';
export * from './entities/mall-coupon.entity';
export * from './entities/mall-member-coupon.entity';
export * from './entities/mall-after-sale.entity';
export * from './entities/mall-delivery.entity';
export * from './entities/notification.entity';
export * from './entities/notification-task.entity';
export * from './entities/notification-setting.entity';
export * from './entities/flash-sale-activity.entity';
export * from './entities/flash-sale-product.entity';

export const ALL_ENTITIES = [
    UserEntity,
    RoleEntity,
    MenuEntity,
    ArticleEntity,
    CategoryEntity,
    TagEntity,
    CommentEntity,
    ResourceEntity,
    DictTypeEntity,
    DictDataEntity,
    SystemConfigEntity,
    MemberEntity,
    MemberFavoriteEntity,
    MallCategoryEntity,
    MallProductEntity,
    MallProductSkuEntity,
    MallOrderEntity,
    MallOrderItemEntity,
    MallPaymentEntity,
    MallOrderEntity,
    CollectionEntity,
    CollectionItemEntity,
    MemberAuthEntity,
    MemberAddressEntity,
    SystemLogEntity,
    MallShippingTemplateEntity,
    MallShippingRuleEntity,
    MallShippingFreeRuleEntity,
    RegionEntity,
    MallCouponEntity,
    MallMemberCouponEntity,
    MallAfterSaleEntity,
    MallDeliveryEntity,
    NotificationEntity,
    NotificationTaskEntity,
    NotificationSettingEntity,
    FlashSaleActivityEntity,
    FlashSaleProductEntity,
];
