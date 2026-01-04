import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import {
    FlashSaleActivityEntity,
    FlashSaleProductEntity,
    MallOrderEntity,
} from '@app/db';
import { RedisClientService } from '@app/redis';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { FLASH_SALE_ORDER_QUEUE } from '@app/queue';
import { FlashSaleOrderDto } from './dto/flash-sale.dto';

@Injectable()
export class FlashSaleService implements OnModuleInit {
    private luaScript = `
        local stockKey = KEYS[1]
        local userLimitKey = KEYS[2]
        local userId = ARGV[1]
        local limit = tonumber(ARGV[2])
        local ttl = tonumber(ARGV[3])

        -- 检查库存
        local stock = redis.call('get', stockKey)
        if not stock or tonumber(stock) <= 0 then
            return -1 -- 库存不足
        end

        -- 检查个人限购
        local userBuyCount = redis.call('hget', userLimitKey, userId)
        if userBuyCount and tonumber(userBuyCount) >= limit then
            return -2 -- 超过限购
        end

        -- 扣减库存
        redis.call('decr', stockKey)
        -- 记录用户购买
        redis.call('hincrby', userLimitKey, userId, 1)
        
        -- 设置过期时间
        if ttl and ttl > 0 then
            redis.call('expire', userLimitKey, ttl)
        end

        return 1 -- 成功
    `;

    private scriptSha: string;

    constructor(
        @InjectRepository(FlashSaleActivityEntity)
        private readonly activityRepo: Repository<FlashSaleActivityEntity>,
        @InjectRepository(FlashSaleProductEntity)
        private readonly productRepo: Repository<FlashSaleProductEntity>,
        private readonly redis: RedisClientService,
        @InjectQueue(FLASH_SALE_ORDER_QUEUE)
        private readonly orderQueue: Queue
    ) {}

    async onModuleInit() {
        const client = await this.redis.getClient();
        this.scriptSha = await (client as any).scriptLoad(this.luaScript);
    }

    async createOrder(memberId: number, dto: FlashSaleOrderDto) {
        if (!memberId) {
            throw new BadRequestException('用户未登录或 memberId 为空');
        }
        const { activityId, skuId } = dto;

        // 1. 基本校验 (活动是否进行中)
        const activity = await this.activityRepo.findOne({
            where: { id: activityId },
        });
        if (!activity || activity.status !== 1) {
            throw new BadRequestException('活动不存在或已禁用');
        }

        const now = new Date();
        if (now < activity.startTime)
            throw new BadRequestException('活动尚未开始');
        if (now > activity.endTime) throw new BadRequestException('活动已结束');

        // 2. Redis 原子扣减
        const stockKey = `flash_sale:stock:${skuId}`;
        const userLimitKey = `flash_sale:user_limit:${activityId}:${skuId}`;

        // 计算过期时间：活动结束时间 + 1天
        const ttl =
            Math.floor((activity.endTime.getTime() - now.getTime()) / 1000) +
            86400;

        // 获取限购数量
        const client = await this.redis.getClient();
        const limitStr = await client.get(`flash_sale:limit:${skuId}`);
        const limit = limitStr ? parseInt(limitStr) : 1;

        const result = await (client as any).evalSha(this.scriptSha, {
            keys: [stockKey, userLimitKey],
            arguments: [String(memberId), String(limit), String(ttl)],
        });

        if (result === -1) throw new BadRequestException('商品已抢光');
        if (result === -2) throw new BadRequestException('您已达到购买上限');

        // 3. 异步入队 (配置重试策略)
        await this.orderQueue.add(
            'create_order',
            {
                memberId,
                ...dto,
                timestamp: Date.now(),
            },
            {
                attempts: 3, // 最多重试 3 次
                backoff: {
                    type: 'exponential',
                    delay: 1000, // 第一次重试延迟 1s，之后指数增加
                },
                removeOnComplete: true, // 成功后删除任务
                removeOnFail: false, // 失败后保留任务以便排查
            }
        );

        return { message: '抢购成功，订单处理中', success: true };
    }

    async getActivities() {
        const now = new Date();
        // 使用 find 代替 createQueryBuilder，以确保日期处理一致
        return this.activityRepo.find({
            where: {
                status: 1,
                endTime: MoreThan(now),
            },
            order: {
                startTime: 'ASC',
            },
        });
    }

    async getActivityDetail(id: number) {
        const activity = await this.activityRepo.findOne({ where: { id } });
        if (!activity) throw new BadRequestException('活动不存在');

        const products = await this.productRepo.find({
            where: { activityId: id },
            relations: ['product', 'sku'],
            order: { sort: 'ASC' },
        });
        return { ...activity, products };
    }
}
