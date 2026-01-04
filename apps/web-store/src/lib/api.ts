export const getApiUrl = () => {
    // 优先从环境变量获取端口，确保 SSR 环境下能正确连接到后端
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env.CONTENT_API_PORT) {
        // @ts-ignore
        return `http://localhost:${process.env.CONTENT_API_PORT}`;
    }
    // @ts-ignore
    return import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';
};

export const API_BASE_URL = getApiUrl();

export const API_ENDPOINTS = {
    // 认证
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    PROFILE: `${API_BASE_URL}/auth/profile`,

    // 集合/主题
    COLLECTIONS_ACTIVE: `${API_BASE_URL}/collections/active`,
    COLLECTIONS: `${API_BASE_URL}/collections`,

    // 商品
    PRODUCTS: `${API_BASE_URL}/mall/products`,

    // 会员地址
    MEMBER_ADDRESS: `${API_BASE_URL}/member/address`,

    // 订单
    MEMBER_ORDERS: `${API_BASE_URL}/mall/orders`,
    ORDER_CALCULATE: `${API_BASE_URL}/mall/orders/calculate`,

    // 优惠券
    MEMBER_COUPONS: `${API_BASE_URL}/mall/coupons/my`,
    COUPON_AVAILABLE: `${API_BASE_URL}/mall/coupons/available`,
    COUPON_MATCH: `${API_BASE_URL}/mall/coupons/match`,
    COUPON_CLAIM: `${API_BASE_URL}/mall/coupons/claim/:id`,

    // 售后
    MEMBER_AFTER_SALES: `${API_BASE_URL}/mall/after-sales`,

    // 秒杀
    FLASH_SALE_ACTIVITIES: `${API_BASE_URL}/mall/flash-sale/activities`,
    FLASH_SALE_DETAIL: `${API_BASE_URL}/mall/flash-sale/activity/:id`,
    FLASH_SALE_ORDER: `${API_BASE_URL}/mall/flash-sale/order`,

    // 搜索
    SEARCH: `${API_BASE_URL}/search`,

    // 文章
    ARTICLES: `${API_BASE_URL}/articles`,
};

/**
 * 通用的请求辅助函数，处理后端统一的响应格式 { code, data, message }
 */
export async function request<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || '请求失败');
    }

    // 后端统一返回格式处理
    if (
        result &&
        typeof result === 'object' &&
        'code' in result &&
        'data' in result
    ) {
        if (result.code !== 0 && result.code !== 200 && result.code !== 201) {
            throw new Error(result.message || '请求失败');
        }
        return result.data as T;
    }

    return result as T;
}
