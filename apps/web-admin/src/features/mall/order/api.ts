import { api } from '@/lib/axios';

export const OrderStatus = {
    PENDING_PAY: 'PENDING_PAY',
    PENDING_DELIVERY: 'PENDING_DELIVERY',
    PARTIALLY_SHIPPED: 'PARTIALLY_SHIPPED',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface OrderItem {
    id: number;
    productId: number;
    skuId: number;
    productName: string;
    productImg?: string;
    skuSpecs?: any;
    price: number;
    quantity: number;
    shippedQuantity: number;
}

export interface OrderDelivery {
    id: number;
    deliverySn: string;
    deliveryCompany: string;
    items: any[];
    remark?: string;
    createdAt: string;
}

export interface OrderPayment {
    id: number;
    transactionId: string;
    paymentMethod: string;
    amount: number;
    status: string;
    paidAt: string;
}

export interface Order {
    id: number;
    orderNo: string;
    memberId: number;
    totalAmount: number;
    payAmount: number;
    status: OrderStatus;
    receiverInfo: any;
    remark?: string;
    paidAt?: string;
    createdAt: string;
    items?: OrderItem[];
    deliveries?: OrderDelivery[];
    payment?: OrderPayment;
    member?: any;
}

export interface OrderQueryParams {
    page?: number;
    pageSize?: number;
    orderNo?: string;
    status?: OrderStatus;
    memberId?: number;
}

export interface OrderListResponse {
    items: Order[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ShipItemDto {
    skuId: number;
    quantity: number;
}

export interface ShipOrderDto {
    trackingNo: string;
    carrier: string;
    items: ShipItemDto[];
    remark?: string;
}

export const getOrders = async (params?: OrderQueryParams) => {
    const { data } = await api.get<OrderListResponse>('/mall/orders', {
        params,
    });
    return data;
};

export const getOrder = async (id: number) => {
    const { data } = await api.get<Order>(`/mall/orders/${id}`);
    return data;
};

export const shipOrder = async (id: number, data: ShipOrderDto) => {
    return api.post(`/mall/orders/${id}/delivery`, data);
};
