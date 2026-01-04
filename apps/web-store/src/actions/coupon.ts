import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { API_ENDPOINTS, request } from '../lib/api';

export const couponActions = {
    // 获取当前订单可用的优惠券
    getMatch: defineAction({
        accept: 'json',
        input: z.object({
            totalAmount: z.number(),
            items: z.array(
                z.object({
                    productId: z.number(),
                    categoryId: z.number(),
                    price: z.number(),
                    quantity: z.number(),
                })
            ),
        }),
        handler: async (input, context) => {
            const token = await context?.session?.get('token');
            if (!token) {
                throw new Error('请先登录');
            }

            return request(API_ENDPOINTS.COUPON_MATCH, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(input),
            });
        },
    }),

    // 获取我的优惠券列表
    getMyCoupons: defineAction({
        accept: 'json',
        input: z
            .object({
                status: z
                    .enum(['AVAILABLE', 'USED', 'EXPIRED'])
                    .optional()
                    .default('AVAILABLE'),
            })
            .optional(),
        handler: async (input, context) => {
            const token = await context?.session?.get('token');
            if (!token) {
                throw new Error('请先登录');
            }

            const url = new URL(API_ENDPOINTS.MEMBER_COUPONS);

            // 映射状态为后端需要的数值
            // MemberCouponStatus { UNUSED = 1, USED = 2, EXPIRED = 3, LOCKED = 4 }
            const statusMap = {
                AVAILABLE: '1',
                USED: '2',
                EXPIRED: '3',
            };

            if (input?.status) {
                url.searchParams.append('status', statusMap[input.status]);
            }

            return request(url.toString(), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        },
    }),

    // 获取可领取的优惠券列表
    getAvailable: defineAction({
        accept: 'json',
        handler: async (_, context) => {
            return request(API_ENDPOINTS.COUPON_AVAILABLE);
        },
    }),

    // 领取优惠券
    claim: defineAction({
        accept: 'json',
        input: z.object({
            id: z.number(),
        }),
        handler: async (input, context) => {
            const token = await context?.session?.get('token');
            if (!token) {
                throw new Error('请先登录');
            }

            return request(
                API_ENDPOINTS.COUPON_CLAIM.replace(':id', input.id.toString()),
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        },
    }),
};
