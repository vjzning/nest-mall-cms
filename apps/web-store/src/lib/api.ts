export const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';

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
};
