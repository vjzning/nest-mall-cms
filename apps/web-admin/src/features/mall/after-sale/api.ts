import { api } from '@/lib/axios';

export const AfterSaleTypeMap = {
    REFUND_ONLY: 1,
    RETURN_AND_REFUND: 2,
    EXCHANGE: 3,
} as const;

export type AfterSaleType =
    (typeof AfterSaleTypeMap)[keyof typeof AfterSaleTypeMap];

export const AfterSaleStatusMap = {
    APPLIED: 'APPLIED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    WAITING_RECEIPT: 'WAITING_RECEIPT',
    PROCESSING: 'PROCESSING',
    REFUNDED: 'REFUNDED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const;

export type AfterSaleStatus =
    (typeof AfterSaleStatusMap)[keyof typeof AfterSaleStatusMap];

export interface AfterSaleItem {
    id: number;
    orderItemId: number;
    skuId: number;
    quantity: number;
    price: string;
}

export interface AfterSale {
    id: number;
    afterSaleNo: string;
    orderId: number;
    orderNo: string;
    memberId: number;
    type: AfterSaleType;
    status: AfterSaleStatus;
    applyReason: string;
    description?: string;
    images?: string[];
    applyAmount: string;
    actualAmount: string;
    adminRemark?: string;
    handleTime?: string;
    createdAt: string;
    updatedAt: string;
    member?: {
        id: number;
        nickname?: string;
        mobile?: string;
    };
    items?: AfterSaleItem[];
    logistics?: any[];
}

export interface AfterSaleQueryParams {
    page?: number;
    limit?: number;
    status?: AfterSaleStatus;
    afterSaleNo?: string;
    orderNo?: string;
}

export interface AfterSaleListResponse {
    items: AfterSale[];
    total: number;
}

export const afterSaleApi = {
    findAll: async (params?: AfterSaleQueryParams) => {
        const { data } = await api.get<AfterSaleListResponse>(
            '/mall/after-sales',
            { params }
        );
        return data;
    },
    findOne: async (id: number) => {
        const { data } = await api.get<AfterSale>(`/mall/after-sales/${id}`);
        return data;
    },
    audit: async (
        id: number,
        data: {
            status: AfterSaleStatus;
            adminRemark?: string;
            actualAmount?: number;
        }
    ) => {
        const { data: res } = await api.patch<AfterSale>(
            `/mall/after-sales/${id}/audit`,
            data
        );
        return res;
    },
    confirmReceipt: async (id: number) => {
        const { data: res } = await api.patch<AfterSale>(
            `/mall/after-sales/${id}/confirm-receipt`
        );
        return res;
    },
    resendLogistics: async (
        id: number,
        data: { trackingNo: string; carrier: string }
    ) => {
        const { data: res } = await api.post<AfterSale>(
            `/mall/after-sales/${id}/resend`,
            data
        );
        return res;
    },
};
