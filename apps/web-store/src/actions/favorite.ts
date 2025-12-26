import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getApiUrl } from '../lib/api';

export const favorite = {
    toggle: defineAction({
        input: z.object({
            productId: z.union([z.number(), z.string().transform(Number)]),
        }),
        handler: async ({ productId }, context) => {
            const token = await context.session?.get('token');
            if (!token) {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: '请先登录',
                });
            }

            const response = await fetch(
                `${getApiUrl()}/member/favorite/toggle`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ productId }),
                }
            );

            if (!response.ok) {
                const error = await response
                    .json()
                    .catch(() => ({ message: '操作失败' }));
                throw new ActionError({
                    code: 'BAD_REQUEST',
                    message: error.message,
                });
            }

            return response.json();
        },
    }),

    list: defineAction({
        input: z
            .object({
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
            if (input?.page) queryParams.append('page', input.page.toString());
            if (input?.limit)
                queryParams.append('limit', input.limit.toString());

            const response = await fetch(
                `${getApiUrl()}/member/favorite/list?${queryParams.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new ActionError({
                    code: 'BAD_REQUEST',
                    message: '获取收藏列表失败',
                });
            }

            return response.json();
        },
    }),

    check: defineAction({
        input: z.object({
            productId: z.number(),
        }),
        handler: async ({ productId }, context) => {
            const token = await context.session?.get('token');
            if (!token) return { favorited: false };

            const response = await fetch(
                `${getApiUrl()}/member/favorite/check?productId=${productId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) return { favorited: false };

            return response.json();
        },
    }),
};
