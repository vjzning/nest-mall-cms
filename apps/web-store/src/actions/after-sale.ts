import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { API_ENDPOINTS, request } from '../lib/api';

export const afterSaleActions = {
    // 申请售后
    apply: defineAction({
        accept: 'json',
        input: z.object({
            orderId: z.number(),
            type: z.number(),
            applyReason: z.string(),
            description: z.string().optional(),
            images: z.array(z.string()).optional(),
            items: z.array(
                z.object({
                    orderItemId: z.number(),
                    quantity: z.number(),
                })
            ),
        }),
        handler: async (input, context) => {
            const token = await context?.session?.get('token');
            if (!token) {
                throw new Error('请先登录');
            }

            return request(`${API_ENDPOINTS.MEMBER_AFTER_SALES}/apply`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(input),
            });
        },
    }),

    // 获取售后列表
    getList: defineAction({
        input: z
            .object({
                page: z.number().default(1),
                limit: z.number().default(10),
            })
            .optional(),
        handler: async (input, context) => {
            const token = await context?.session?.get('token');
            if (!token) {
                throw new Error('请先登录');
            }

            const queryParams = new URLSearchParams();
            if (input?.page) queryParams.append('page', input.page.toString());
            if (input?.limit)
                queryParams.append('limit', input.limit.toString());

            return request(`${API_ENDPOINTS.MEMBER_AFTER_SALES}?${queryParams.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        },
    }),

    // 获取售后详情
    getDetail: defineAction({
        input: z.object({
            id: z.string(),
        }),
        handler: async (input, context) => {
            const token = await context?.session?.get('token');
            if (!token) {
                throw new Error('请先登录');
            }

            return request(`${API_ENDPOINTS.MEMBER_AFTER_SALES}/${input.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        },
    }),

    // 提交退货物流
    submitLogistics: defineAction({
        accept: 'json',
        input: z.object({
            id: z.string(),
            trackingNo: z.string(),
            carrier: z.string(),
        }),
        handler: async (input, context) => {
            const token = await context?.session?.get('token');
            if (!token) {
                throw new Error('请先登录');
            }

            const { id, ...data } = input;
            return request(`${API_ENDPOINTS.MEMBER_AFTER_SALES}/${id}/logistics`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
        },
    }),
};
