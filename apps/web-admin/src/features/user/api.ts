import { api } from '@/lib/axios';

export interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  status: number;
  roles?: Role[];
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface CreateUserDto {
  username: string;
  password?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  status?: number;
  roleIds?: number[];
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}

export const userApi = {
  findAll: async () => {
    const { data } = await api.get<User[]>('/user');
    return data;
  },
  findOne: async (id: number) => {
    const { data } = await api.get<User>(`/user/${id}`);
    return data;
  },
  create: async (data: CreateUserDto) => {
    const { data: res } = await api.post<User>('/user', data);
    return res;
  },
  update: async (id: number, data: UpdateUserDto) => {
    const { data: res } = await api.put<User>(`/user/${id}`, data);
    return res;
  },
  remove: async (id: number) => {
    await api.delete(`/user/${id}`);
  },
  resetPassword: async (id: number) => {
    await api.post(`/user/${id}/reset-password`);
  },
};
