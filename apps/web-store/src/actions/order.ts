import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { API_ENDPOINTS, request } from '../lib/api';

export const orderActions = {
    // 创建订单
    create: defineAction({
        accept: 'json',
        input: z.object({
            receiverInfo: z.object({
                name: z.string(),
                phone: z.string(),
                address: z.string(),
                provinceId: z.number().nullable().optional(),
            }),
            paymentMethod: z.string().default('alipay'),
            remark: z.string().optional(),
            memberCouponId: z.number().optional(),
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
                receiverInfo: input.receiverInfo,
                paymentMethod: input.paymentMethod,
                remark: input.remark,
                memberCouponId: input.memberCouponId,
                items: cartItems.map((item: any) => ({
                    skuId: item.skuId,
                    quantity: item.quantity,
                })),
            };

            const data: any = await request(API_ENDPOINTS.MEMBER_ORDERS, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            });

            return {
                success: true,
                order: data.order,
                payParams: data.payParams,
            };
        },
    }),

    // 计算订单预览（包括运费和优惠券）
    calculate: defineAction({
        accept: 'json',
        input: z.object({
            addressId: z.number().optional(),
            memberCouponId: z.number().optional(),
        }),
        handler: async (input, context) => {
            const token = await context?.session?.get('token');
            if (!token) {
                throw new Error('请先登录');
            }

            const cartItems = await context?.session?.get('cartItems');
            if (!cartItems || cartItems.length === 0) {
                return {
                    totalAmount: 0,
                    shippingFee: 0,
                    discountAmount: 0,
                    payAmount: 0,
                };
            }

            const calcData: any = {
                memberCouponId: input.memberCouponId,
                items: cartItems.map((item: any) => ({
                    skuId: item.skuId,
                    quantity: item.quantity,
                })),
                paymentMethod: 'alipay', // 默认支付方式，计算预览需要
            };

            // 如果传了 addressId，需要获取地址详情来构造 receiverInfo
            if (input.addressId) {
                try {
                    const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';
                    const addr: any = await request(`${apiUrl}/member/address/${input.addressId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    calcData.receiverInfo = {
                        name: addr.receiverName,
                        phone: addr.receiverPhone,
                        provinceId: addr.provinceId,
                        address: `${addr.stateProvince}${addr.city}${addr.districtCounty}${addr.addressLine1}`,
                    };
                } catch (e) {
                    console.error('获取地址详情失败:', e);
                }
            }

            // 如果没有地址信息，也需要提供一个空的 receiverInfo 对象以满足 DTO 校验
            if (!calcData.receiverInfo) {
                calcData.receiverInfo = {
                    name: 'temp',
                    phone: 'temp',
                    provinceId: '0',
                    address: 'temp'
                };
            }

            return request(API_ENDPOINTS.ORDER_CALCULATE, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(calcData),
            });
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

            return request(
                `${API_ENDPOINTS.MEMBER_ORDERS}?${queryParams.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
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

            return request(
                `${API_ENDPOINTS.MEMBER_ORDERS}/${input.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
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

            return request(
                `${API_ENDPOINTS.MEMBER_ORDERS}/${input.id}/cancel`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
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

            return request(
                `${API_ENDPOINTS.MEMBER_ORDERS}/${input.id}/confirm-receipt`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        },
    }),

    // 重新支付
    repay: defineAction({
        accept: 'json',
        input: z.object({
            id: z.union([z.number(), z.string().transform(Number)]),
            paymentMethod: z.string().default('alipay'),
        }),
        handler: async (input, context) => {
            const token = await context?.session?.get('token');
            if (!token) {
                throw new Error('请先登录');
            }

            return request(
                `${API_ENDPOINTS.MEMBER_ORDERS}/${input.id}/pay`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        paymentMethod: input.paymentMethod,
                    }),
                }
            );
        },
    }),
};
