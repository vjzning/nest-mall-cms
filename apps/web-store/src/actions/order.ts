import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getApiUrl } from '../lib/api';
import { getSession } from '../lib/session';

export const order = {
    getMyOrders: defineAction({
        input: z
            .object({
                status: z.string().optional(),
                page: z.number().default(1),
                limit: z.number().default(10),
            })
            .optional(),
        handler: async (input, context) => {
            const token = await context.session?.get('token');
            if (!token) {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: '请先登录',
                });
            }

            const queryParams = new URLSearchParams();
            if (input?.status && input.status !== 'ALL')
                queryParams.append('status', input.status);
            if (input?.page) queryParams.append('page', input.page.toString());
            if (input?.limit)
                queryParams.append('limit', input.limit.toString());

            const response = await fetch(
                `${getApiUrl()}/mall/orders?${queryParams.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const error = await response
                    .json()
                    .catch(() => ({ message: '获取订单失败' }));
                throw new ActionError({
                    code: 'BAD_REQUEST',
                    message: error.message,
                });
            }

            return response.json();
        },
    }),

    getOrderDetail: defineAction({
        input: z.object({
            id: z.number(),
        }),
        handler: async ({ id }, context) => {
            const token = await context.session?.get('token');
            if (!token) {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: '请先登录',
                });
            }

            const response = await fetch(`${getApiUrl()}/mall/orders/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new ActionError({
                    code: 'BAD_REQUEST',
                    message: '获取订单详情失败',
                });
            }

            return response.json();
        },
    }),

    cancelOrder: defineAction({
        input: z.object({
            id: z.number(),
        }),
        handler: async ({ id }, context) => {
            const token = await context.session?.get('token');
            if (!token) {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: '请先登录',
                });
            }

            const response = await fetch(
                `${getApiUrl()}/mall/orders/${id}/cancel`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const error = await response
                    .json()
                    .catch(() => ({ message: '取消订单失败' }));
                throw new ActionError({
                    code: 'BAD_REQUEST',
                    message: error.message,
                });
            }

            return response.json();
        },
    }),

    confirmReceipt: defineAction({
        input: z.object({
            id: z.number(),
        }),
        handler: async ({ id }, context) => {
            const token = await context.session?.get('token');
            if (!token) {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: '请先登录',
                });
            }

            const response = await fetch(
                `${getApiUrl()}/mall/orders/${id}/confirm-receipt`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const error = await response
                    .json()
                    .catch(() => ({ message: '确认收货失败' }));
                throw new ActionError({
                    code: 'BAD_REQUEST',
                    message: error.message,
                });
            }

            return response.json();
        },
    }),
};
