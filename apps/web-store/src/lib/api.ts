export const getApiUrl = () => {
  // 优先从环境变量获取端口，确保 SSR 环境下能正确连接到后端
  if (typeof process !== 'undefined' && process.env.CONTENT_API_PORT) {
    return `http://localhost:${process.env.CONTENT_API_PORT}`;
  }
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
};
