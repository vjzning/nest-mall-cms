import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import type { CouponMatchContext } from './coupon-strategy.interface';
import { Log } from '@app/shared/decorators/log.decorator';
import { MemberCouponStatus } from '@app/db/entities/mall-member-coupon.entity';

@Controller('mall/coupons')
export class CouponController {
    constructor(private readonly couponService: CouponService) {}

    /**
     * 获取可领取的优惠券列表
     */
    @Get('available')
    findAllAvailable() {
        return this.couponService.findAllAvailable();
    }

    /**
     * 领取优惠券
     */
    @Post('claim/:id')
    @UseGuards(JwtAuthGuard)
    @Log({ module: '商城优惠券', action: '领取优惠券' })
    claim(@Param('id') id: string, @Request() req: any) {
        return this.couponService.claim(req.user.id, +id);
    }

    /**
     * 获取当前订单可用的优惠券
     */
    @Post('match')
    @UseGuards(JwtAuthGuard)
    matchAvailableCoupons(
        @Request() req: any,
        @Body() context: CouponMatchContext
    ) {
        return this.couponService.matchAvailableCoupons(req.user.id, context);
    }

    /**
     * 获取我的优惠券
     */
    @Get('my')
    @UseGuards(JwtAuthGuard)
    findMyCoupons(@Request() req: any, @Query('status') status?: string) {
        const couponStatus = status
            ? (parseInt(status) as MemberCouponStatus)
            : undefined;
        return this.couponService.findMyCoupons(req.user.id, couponStatus);
    }
}
