import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MallCouponEntity } from '@app/db/entities/mall-coupon.entity';
import { MallCouponScopeEntity } from '@app/db/entities/mall-coupon-scope.entity';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MallCouponEntity,
      MallCouponScopeEntity,
    ]),
  ],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}
