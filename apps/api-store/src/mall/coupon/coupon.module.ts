import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { MallCouponEntity } from '@app/db/entities/mall-coupon.entity';
import { MallMemberCouponEntity } from '@app/db/entities/mall-member-coupon.entity';
import { MallCouponScopeEntity } from '@app/db/entities/mall-coupon-scope.entity';
import { RedisLockModule } from '@app/redis/lock/redis-lock.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MallCouponEntity,
            MallMemberCouponEntity,
            MallCouponScopeEntity,
        ]),
        RedisLockModule,
    ],
    controllers: [CouponController],
    providers: [CouponService],
    exports: [CouponService],
})
export class CouponModule {}
