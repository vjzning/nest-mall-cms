import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { API_ENDPOINTS } from '../lib/api';

export const flashSaleActions = {
    // 获取秒杀活动列表
    getActivities: defineAction({
        handler: async () => {
            const response = await fetch(API_ENDPOINTS.FLASH_SALE_ACTIVITIES);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '获取活动列表失败');
            }
            return await response.json();
        },
    }),

    // 获取秒杀活动详情
    getActivityDetail: defineAction({
        input: z.object({
            id: z.number(),
        }),
        handler: async (input) => {
            const url = API_ENDPOINTS.FLASH_SALE_DETAIL.replace(':id', input.id.toString());
            const response = await fetch(url);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '获取活动详情失败');
            }
            return await response.json();
        },
    }),

    // 秒杀下单
    createOrder: defineAction({
        accept: 'json',
        input: z.object({
            activityId: z.number(),
            skuId: z.number(),
            addressId: z.number(),
        }),
        handler: async (input, context) => {
            const token = await context?.session?.get('token');
            if (!token) {
                throw new Error('请先登录');
            }

            const response = await fetch(API_ENDPOINTS.FLASH_SALE_ORDER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '抢购失败');
            }

            return await response.json();
        },
    }),
};
