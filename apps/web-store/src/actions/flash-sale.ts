import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { API_ENDPOINTS, request } from '../lib/api';

export const flashSaleActions = {
    // 获取秒杀活动列表
    getActivities: defineAction({
        handler: async () => {
            return request(API_ENDPOINTS.FLASH_SALE_ACTIVITIES);
        },
    }),

    // 获取秒杀活动详情
    getActivityDetail: defineAction({
        input: z.object({
            id: z.number(),
        }),
        handler: async (input) => {
            const url = API_ENDPOINTS.FLASH_SALE_DETAIL.replace(':id', input.id.toString());
            return request(url);
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

            return request(API_ENDPOINTS.FLASH_SALE_ORDER, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(input),
            });
        },
    }),
};
