import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { API_ENDPOINTS } from '../lib/api';

export const orderActions = {
    // 创建订单
    create: defineAction({
        accept: 'form',
        input: z.object({
            addressId: z.number(),
            paymentMethod: z.string().default('alipay'),
            remark: z.string().optional(),
        }),
        handler: async (input, context) => {
            const token = await context?.session?.get('token');
            if (!token) {
                throw new Error('请先登录');
            }

            // 获取购物车数据
            const cartItems = await context?.session?.get('cartItems');
            if (!cartItems || cartItems.length === 0) {
                throw new Error('购物车为空');
            }

            const orderData = {
                addressId: input.addressId,
                paymentMethod: input.paymentMethod,
                remark: input.remark,
                items: cartItems.map((item: any) => ({
                    skuId: item.skuId,
                    quantity: item.quantity,
                })),
            };

            const response = await fetch(API_ENDPOINTS.MEMBER_ORDERS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || '创建订单失败');
            }

            // 订单创建成功，清空购物车
            await context?.session?.set('cartItems', []);

            return {
                success: true,
                order: result.order,
                payParams: result.payParams,
            };
        },
    }),

    // 获取我的订单列表
    getMyOrders: defineAction({
        input: z
            .object({
                status: z.string().optional(),
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
            // 如果 status 为 'ALL' 或未提供，则不传 status 参数，让后端返回所有
            if (input?.status && input.status !== 'ALL') {
                queryParams.append('status', input.status);
            }
            if (input?.page) queryParams.append('page', input.page.toString());
            if (input?.limit)
                queryParams.append('limit', input.limit.toString());

            const response = await fetch(
                `${API_ENDPOINTS.MEMBER_ORDERS}?${queryParams.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('获取订单列表失败');
            }

            return response.json();
        },
    }),

    // 获取订单详情
    getDetail: defineAction({
        input: z.object({
            id: z.string(),
        }),
        handler: async (input, context) => {
            const token = await context?.session?.get('token');
            if (!token) {
                throw new Error('请先登录');
            }

            const response = await fetch(
                `${API_ENDPOINTS.MEMBER_ORDERS}/${input.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('获取订单详情失败');
            }

            return response.json();
        },
    }),

    // 取消订单
    cancelOrder: defineAction({
        input: z.object({
            id: z.union([z.number(), z.string().transform(Number)]),
        }),
        handler: async (input, context) => {
            const token = await context?.session?.get('token');
            if (!token) {
                throw new Error('请先登录');
            }

            const response = await fetch(
                `${API_ENDPOINTS.MEMBER_ORDERS}/${input.id}/cancel`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || '取消订单失败');
            }

            return response.json();
        },
    }),

    // 确认收货
    confirmReceipt: defineAction({
        input: z.object({
            id: z.union([z.number(), z.string().transform(Number)]),
        }),
        handler: async (input, context) => {
            const token = await context?.session?.get('token');
            if (!token) {
                throw new Error('请先登录');
            }

            const response = await fetch(
                `${API_ENDPOINTS.MEMBER_ORDERS}/${input.id}/confirm-receipt`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || '确认收货失败');
            }

            return response.json();
        },
    }),
};
