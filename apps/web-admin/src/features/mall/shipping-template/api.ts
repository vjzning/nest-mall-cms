import { api } from '@/lib/axios';

export interface ShippingRule {
  id?: number;
  regionIds: string[];
  regionNames?: string[];
  firstAmount: number;
  firstFee: number;
  extraAmount: number;
  extraFee: number;
}

export interface ShippingFreeRule {
  id?: number;
  regionIds: string[];
  regionNames?: string[];
  condType: number; // 1-按件数, 2-按金额, 3-按件数+金额
  fullAmount?: number;
  fullQuantity?: number;
}

export interface ShippingTemplate {
  id: number;
  name: string;
  chargeType: number; // 1-按件数, 2-按重量, 3-按体积
  isDefault: boolean;
  status: number;
  rules: ShippingRule[];
  freeRules: ShippingFreeRule[];
  createdAt: string;
}

export interface CreateShippingTemplateDto {
  name: string;
  chargeType: number;
  isDefault?: boolean;
  status?: number;
  rules: ShippingRule[];
  freeRules?: ShippingFreeRule[];
}

export interface UpdateShippingTemplateDto extends Partial<CreateShippingTemplateDto> {}

export interface ShippingTemplateListResponse {
  items: ShippingTemplate[];
  total: number;
}

export const getShippingTemplates = async (params?: { page?: number; pageSize?: number }) => {
  const { data } = await api.get<ShippingTemplateListResponse>('/mall/shipping-templates', { params });
  return data;
};

export const getShippingTemplate = async (id: number) => {
  const { data } = await api.get<ShippingTemplate>(`/mall/shipping-templates/${id}`);
  return data;
};

export const createShippingTemplate = async (data: CreateShippingTemplateDto) => {
  return api.post('/mall/shipping-templates', data);
};

export const updateShippingTemplate = async (id: number, data: UpdateShippingTemplateDto) => {
  return api.patch(`/mall/shipping-templates/${id}`, data);
};

export const deleteShippingTemplate = async (id: number) => {
  return api.delete(`/mall/shipping-templates/${id}`);
};

export const getRegionTree = async () => {
  const { data } = await api.get('/system/region/tree');
  return data;
};
