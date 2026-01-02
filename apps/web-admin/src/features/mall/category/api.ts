import { api } from '@/lib/axios';

export interface MallCategory {
  id: number;
  parentId?: number;
  name: string;
  icon?: string;
  pic?: string;
  sort?: number;
  status: number; // 1:启用 0:禁用
  isRecommend: number; // 1:是 0:否
  level: number;
  createdAt: string;
  children?: MallCategory[];
}

export interface CreateMallCategoryDto {
  parentId?: number;
  name: string;
  icon?: string;
  pic?: string;
  sort?: number;
  status?: number;
  isRecommend?: number;
}

export interface UpdateMallCategoryDto extends Partial<CreateMallCategoryDto> {}

export const mallCategoryApi = {
  findAll: async () => {
    // 假设后端接口返回的是树形结构数组
    const { data } = await api.get<MallCategory[]>('/mall/categories');
    return data;
  },
  findOne: async (id: number) => {
    const { data } = await api.get<MallCategory>(`/mall/categories/${id}`);
    return data;
  },
  create: async (data: CreateMallCategoryDto) => {
    const { data: res } = await api.post<MallCategory>('/mall/categories', data);
    return res;
  },
  update: async (id: number, data: UpdateMallCategoryDto) => {
    const { data: res } = await api.patch<MallCategory>(`/mall/categories/${id}`, data);
    return res;
  },
  remove: async (id: number) => {
    await api.delete(`/mall/categories/${id}`);
  },
};
