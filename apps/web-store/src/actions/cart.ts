import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { API_ENDPOINTS, request } from '../lib/api';

const getCartState = async (context: any) => {
    const cartItems = await context.session.get('cartItems');
    const items = cartItems || [];

    // 计算总数和总价格
    const count = items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
    );
    let total = 0;
    const enrichedItems = [];

    // 获取商品详情来计算总价格并丰富数据
    for (const item of items) {
        try {
            const url = `${API_ENDPOINTS.PRODUCTS}/${item.productId}`;
            console.log(`正在获取商品详情: ${url}`);
            const product: any = await request(url);

            // 确保 ID 匹配时使用相同的类型比较
            const sku = product.skus?.find(
                (s: any) => Number(s.id) === Number(item.skuId)
            );

            if (sku) {
                total += sku.price * item.quantity;
                enrichedItems.push({
                    ...item,
                    name: product.name,
                    cover: product.cover,
                    categoryId: product.categoryId,
                    price: sku.price,
                    totalPrice: Number(
                        (sku.price * item.quantity).toFixed(2)
                    ),
                });
            } else {
                console.warn(
                    `未找到 SKU: ${item.skuId}，商品 ID: ${item.productId}`
                );
                enrichedItems.push(item);
            }
        } catch (e) {
            console.error('获取商品详情异常:', e);
            enrichedItems.push(item);
        }
    }

    return {
        success: true,
        cartItems: enrichedItems,
        count,
        total: Number(total.toFixed(2)),
    };
};

export const cartActions = {
    // 添加到购物车 action
    addToCart: defineAction({
        accept: 'form',
        input: z.object({
            productId: z.number(),
            skuId: z.number(),
            quantity: z.number().min(1, '数量至少为1').default(1),
        }),
        handler: async (input, context) => {
            try {
                if (!context.session) {
                    throw new Error('会话未初始化');
                }

                // 获取当前购物车数据
                let cartItems = await context.session.get('cartItems');
                if (!cartItems) {
                    cartItems = [];
                }

                // 检查是否已存在相同SKU
                const existingIndex = cartItems.findIndex(
                    (item: any) => item.skuId === input.skuId
                );

                if (existingIndex > -1) {
                    // 更新数量
                    cartItems[existingIndex].quantity += input.quantity;
                } else {
                    // 添加新商品
                    cartItems.push({
                        productId: input.productId,
                        skuId: input.skuId,
                        quantity: input.quantity,
                    });
                }

                // 保存购物车数据到 session
                await context.session.set('cartItems', cartItems, {
                    ttl: 60 * 5, // 5分钟过期
                });

                return getCartState(context);
            } catch (error: any) {
                throw new Error(error.message || '添加到购物车失败');
            }
        },
    }),

    // 获取购物车数据
    getCart: defineAction({
        accept: 'form',
        handler: async (_input, context) => {
            try {
                if (!context.session) {
                    throw new Error('会话未初始化');
                }

                return getCartState(context);
            } catch (error: any) {
                throw new Error(error.message || '获取购物车数据失败');
            }
        },
    }),

    // 更新购物车商品数量
    updateCartItem: defineAction({
        accept: 'form',
        input: z.object({
            skuId: z.number(),
            quantity: z.number().min(0, '数量不能小于0'),
        }),
        handler: async (input, context) => {
            try {
                if (!context.session) {
                    throw new Error('会话未初始化');
                }

                let cartItems = await context.session.get('cartItems');
                if (!cartItems) {
                    cartItems = [];
                }

                const itemIndex = cartItems.findIndex(
                    (item: any) => item.skuId === input.skuId
                );

                if (itemIndex > -1) {
                    if (input.quantity <= 0) {
                        // 删除商品
                        cartItems.splice(itemIndex, 1);
                    } else {
                        // 更新数量
                        cartItems[itemIndex].quantity = input.quantity;
                    }
                }

                // 保存购物车数据到 session
                await context.session.set('cartItems', cartItems);

                return getCartState(context);
            } catch (error: any) {
                throw new Error(error.message || '更新购物车失败');
            }
        },
    }),

    // 清空购物车
    clearCart: defineAction({
        accept: 'form',
        handler: async (_input, context) => {
            try {
                if (!context.session) {
                    throw new Error('会话未初始化');
                }

                await context.session.set('cartItems', []);
                return { success: true, cartItems: [], count: 0, total: 0 };
            } catch (error: any) {
                throw new Error(error.message || '清空购物车失败');
            }
        },
    }),
};
