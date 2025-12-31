import { api } from '@/lib/axios';

export enum CouponType {
  CASH = 1,
  DISCOUNT = 2,
  FREE_POST = 3,
}

export enum CouponCategory {
  PLATFORM = 1,
  SHOP = 2,
}

export enum CouponScopeType {
  ALL = 1,
  CATEGORY = 2,
  PRODUCT = 3,
}

export enum CouponValidityType {
  FIXED_RANGE = 1,
  DAYS_AFTER_CLAIM = 2,
}

export enum CouponStatus {
  OFF_SHELF = 0,
  ACTIVE = 1,
  ENDED = 2,
}

export interface Coupon {
  id: number;
  name: string;
  type: CouponType;
  category: CouponCategory;
  value: number;
  minAmount: number;
  scopeType: CouponScopeType;
  isStackable: boolean;
  stackingRules?: any;
  totalQuantity: number;
  remainingQuantity: number;
  userLimit: number;
  validityType: CouponValidityType;
  startTime?: string;
  endTime?: string;
  validDays?: number;
  status: CouponStatus;
  createdAt: string;
}

export interface CreateCouponDto {
  name: string;
  type: CouponType;
  category?: CouponCategory;
  value: number;
  minAmount?: number;
  scopeType?: CouponScopeType;
  isStackable?: boolean;
  stackingRules?: any;
  totalQuantity?: number;
  userLimit?: number;
  validityType?: CouponValidityType;
  startTime?: string;
  endTime?: string;
  validDays?: number;
  status?: CouponStatus;
  scopeTargetIds?: number[];
}

export interface UpdateCouponDto extends Partial<CreateCouponDto> {}

export interface CouponListResponse {
  items: Coupon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CouponQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  type?: CouponType;
  status?: CouponStatus;
}

export const couponApi = {
  getCoupons: (params: CouponQueryParams) =>
    api.get<CouponListResponse>('/mall/coupon', { params }),
  
  getCoupon: (id: number) =>
    api.get<Coupon>(`/mall/coupon/${id}`),
  
  createCoupon: (data: CreateCouponDto) =>
    api.post<Coupon>('/mall/coupon', data),
  
  updateCoupon: (id: number, data: UpdateCouponDto) =>
    api.patch<Coupon>(`/mall/coupon/${id}`, data),
  
  deleteCoupon: (id: number) =>
    api.delete(`/mall/coupon/${id}`),
};
