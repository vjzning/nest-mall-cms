import { api } from '@/lib/axios';
import { CollectionType, CollectionLayout } from '@app/shared';

export interface CollectionItem {
    id?: string;
    targetId: number;
    titleOverride?: string;
    imageOverride?: string;
    extraTag?: string;
    sort?: number;
    metadata?: any;
}

export interface Collection {
    id: string;
    code: string;
    type: CollectionType;
    title: string;
    subtitle?: string;
    description?: string;
    coverImage?: string;
    layoutType: CollectionLayout;
    bgColor?: string;
    status: number;
    sort: number;
    startAt?: string | Date | null;
    endAt?: string | Date | null;
    metadata?: any;
    items?: CollectionItem[];
}

export interface CollectionQuery {
    page?: number;
    limit?: number;
    keyword?: string;
    type?: string;
    status?: number;
}

export interface CollectionResponse {
    items: Collection[];
    total: number;
    page: number;
    limit: number;
}

export const collectionApi = {
    findAll: async (params: CollectionQuery) => {
        const { data } = await api.get<CollectionResponse>(
            '/mall/collections',
            { params }
        );
        return data;
    },

    findOne: async (id: string | number) => {
        const { data } = await api.get<Collection>(`/mall/collections/${id}`);
        return data;
    },

    create: async (data: Partial<Collection>) => {
        return api.post('/mall/collections', data);
    },

    update: async (id: string | number, data: Partial<Collection>) => {
        return api.put(`/mall/collections/${id}`, data);
    },

    remove: async (id: string | number) => {
        return api.delete(`/mall/collections/${id}`);
    },

    addItems: async (id: string | number, items: CollectionItem[]) => {
        return api.post(`/mall/collections/${id}/items`, items);
    },
};
