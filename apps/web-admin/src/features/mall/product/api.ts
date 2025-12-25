import { api } from '@/lib/axios';

export interface ProductSku {
  id?: number;
  code: string;
  specs: any;
  price: number;
  marketPrice?: number;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  categoryId?: number;
  cover?: string;
  images?: string[];
  detail?: string;
  status: number;
  sort: number;
  sales: number;
  viewCount: number;
  createdAt: string;
  skus?: ProductSku[];
}

export interface CreateProductDto {
  name: string;
  description?: string;
  categoryId?: number;
  cover?: string;
  images?: string[];
  detail?: string;
  status?: number;
  sort?: number;
  skus: ProductSku[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  categoryId?: number;
  status?: number;
}

export const getProducts = async (params?: ProductQueryParams) => {
  const { data } = await api.get<ProductListResponse>('/mall/products', { params });
  return data;
};

export const getProduct = async (id: number) => {
  const { data } = await api.get<Product>(`/mall/products/${id}`);
  return data;
};

export const createProduct = async (data: CreateProductDto) => {
  return api.post('/mall/products', data);
};

export const updateProduct = async (id: number, data: UpdateProductDto) => {
  return api.patch(`/mall/products/${id}`, data);
};

export const deleteProduct = async (id: number) => {
  return api.delete(`/mall/products/${id}`);
};
