export interface ProductSku {
  id: number;
  code: string;
  specs: Record<string, any>;
  price: number;
  marketPrice: number;
  stock: number;
}

export interface ProductInfo {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  cover: string;
  images: string[];
  detail: string;
  status: number;
  price?: number; // Lowest price among SKUs
  sales: number;
  skus?: ProductSku[];
}

export interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
}
