import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Log } from '@app/shared/decorators/log.decorator';

@Controller('mall/coupon')
export class CouponController {
    constructor(private readonly couponService: CouponService) {}

    /**
     * 创建优惠券模板
     */
    @Post()
    @Log({ module: '优惠券管理', action: '创建优惠券' })
    create(@Body() createCouponDto: CreateCouponDto) {
        return this.couponService.create(createCouponDto);
    }

    /**
     * 分页获取优惠券模板列表
     */
    @Get()
    findAll(@Query() query: any) {
        return this.couponService.findAll(query);
    }

    /**
     * 获取优惠券模板详情
     */
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.couponService.findOne(+id);
    }

    /**
     * 更新优惠券模板
     */
    @Patch(':id')
    @Log({ module: '优惠券管理', action: '更新优惠券' })
    update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
        return this.couponService.update(+id, updateCouponDto);
    }

    /**
     * 删除优惠券模板
     */
    @Delete(':id')
    @Log({ module: '优惠券管理', action: '删除优惠券' })
    remove(@Param('id') id: string) {
        return this.couponService.remove(+id);
    }
}
