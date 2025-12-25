import { api } from '@/lib/axios';
import type { Menu } from '../menu/api';

export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  menus?: Menu[];
}

export interface CreateRoleDto {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {}

export const roleApi = {
  findAll: async () => {
    const { data } = await api.get<Role[]>('/role');
    return data;
  },
  findOne: async (id: number) => {
    const { data } = await api.get<Role>(`/role/${id}`);
    return data;
  },
  create: async (data: CreateRoleDto) => {
    const { data: res } = await api.post<Role>('/role', data);
    return res;
  },
  update: async (id: number, data: UpdateRoleDto) => {
    const { data: res } = await api.put<Role>(`/role/${id}`, data);
    return res;
  },
  remove: async (id: number) => {
    await api.delete(`/role/${id}`);
  },
  assignPermissions: async (id: number, menuIds: number[]) => {
    await api.post(`/role/${id}/permissions`, { menuIds });
  },
};
