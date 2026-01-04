import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { getApiUrl, request } from '../lib/api';

export const favorite = {
    toggle: defineAction({
        accept: 'form',
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

            return request(`${getApiUrl()}/member/favorite/toggle`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId }),
            });
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

            return request(`${getApiUrl()}/member/favorite/list?${queryParams.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        },
    }),

    check: defineAction({
        input: z.object({
            productId: z.number(),
        }),
        handler: async ({ productId }, context) => {
            const token = await context.session?.get('token');
            if (!token) return { favorited: false };

            try {
                return await request(`${getApiUrl()}/member/favorite/check?productId=${productId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } catch (error) {
                return { favorited: false };
            }
        },
    }),
};
