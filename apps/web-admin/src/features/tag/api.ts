import { api } from '@/lib/axios';

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  articleCount?: number;
  created_at: string;
}

export interface CreateTagDto {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateTagDto extends Partial<CreateTagDto> {}

export const tagApi = {
  findAll: async () => {
    const { data } = await api.get<Tag[]>('/tag');
    return data;
  },
  findOne: async (id: number) => {
    const { data } = await api.get<Tag>(`/tag/${id}`);
    return data;
  },
  create: async (data: CreateTagDto) => {
    const { data: res } = await api.post<Tag>('/tag', data);
    return res;
  },
  update: async (id: number, data: UpdateTagDto) => {
    const { data: res } = await api.put<Tag>(`/tag/${id}`, data);
    return res;
  },
  remove: async (id: number) => {
    await api.delete(`/tag/${id}`);
  },
};
