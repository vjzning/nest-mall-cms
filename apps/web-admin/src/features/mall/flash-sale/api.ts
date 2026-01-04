import { api } from '@/lib/axios';

export interface FlashSaleActivity {
    id: number;
    title: string;
    bannerUrl?: string;
    startTime: string;
    endTime: string;
    status: number;
    remark?: string;
    createdAt: string;
    products?: FlashSaleProduct[];
}

export interface FlashSaleProduct {
    id: number;
    activityId: number;
    productId: number;
    skuId: number;
    flashPrice: number;
    stock: number;
    sales: number;
    limitPerUser: number;
    sort: number;
    sku?: any;
    product?: any;
}

export interface CreateFlashSaleActivityDto {
    title: string;
    bannerUrl?: string;
    startTime: string;
    endTime: string;
    status: number;
    remark?: string;
    products: Array<{
        productId: number;
        skuId: number;
        flashPrice: number;
        stock: number;
        limitPerUser: number;
        sort: number;
        _productName?: string;
        _skuSpecs?: any;
    }>;
}

export const flashSaleApi = {
    findAll: async () => {
        const { data } = await api.get<FlashSaleActivity[]>('/mall/flash-sale');
        return data;
    },
    findOne: async (id: number) => {
        const { data } = await api.get<FlashSaleActivity>(
            `/mall/flash-sale/${id}`
        );
        return data;
    },
    create: (data: CreateFlashSaleActivityDto) =>
        api.post('/mall/flash-sale', data),
    update: (id: number, data: Partial<CreateFlashSaleActivityDto>) =>
        api.put(`/mall/flash-sale/${id}`, data),
    delete: (id: number) => api.delete(`/mall/flash-sale/${id}`),
    warmup: (id: number) => api.post(`/mall/flash-sale/${id}/warmup`),
};
