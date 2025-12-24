import { api } from '@/lib/axios';

export interface Category {
  id: number;
  parentId?: number;
  name: string;
  slug: string;
  description?: string;
  articleCount?: number;
  sort: number;
  created_at: string;
  children?: Category[];
}

export interface CreateCategoryDto {
  parentId?: number;
  name: string;
  slug: string;
  description?: string;
  sort?: number;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export const categoryApi = {
  findAll: async () => {
    const { data } = await api.get<Category[]>('/category');
    return data;
  },
  findOne: async (id: number) => {
    const { data } = await api.get<Category>(`/category/${id}`);
    return data;
  },
  create: async (data: CreateCategoryDto) => {
    const { data: res } = await api.post<Category>('/category', data);
    return res;
  },
  update: async (id: number, data: UpdateCategoryDto) => {
    const { data: res } = await api.put<Category>(`/category/${id}`, data);
    return res;
  },
  remove: async (id: number) => {
    await api.delete(`/category/${id}`);
  },
};
