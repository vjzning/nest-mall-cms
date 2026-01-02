import { api } from '@/lib/axios';

export interface Member {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface MemberListResponse {
  items: Member[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MemberQueryParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: number;
}

export const memberApi = {
  findAll: async (params?: MemberQueryParams) => {
    const { data } = await api.get<MemberListResponse>('/mall/member', { params });
    return data;
  },

  findOne: async (id: number) => {
    const { data } = await api.get<Member>(`/mall/member/${id}`);
    return data;
  },

  update: async (id: number, data: Partial<Member>) => {
    const { data: res } = await api.put<Member>(`/mall/member/${id}`, data);
    return res;
  },

  remove: async (id: number) => {
    await api.delete(`/mall/member/${id}`);
  },
};
