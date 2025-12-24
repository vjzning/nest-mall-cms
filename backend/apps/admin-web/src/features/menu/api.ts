import { api } from '@/lib/axios';

export interface Menu {
  id: number | string;
  parentId: number | string;
  name: string;
  code: string;
  type: number; // 1: Directory, 2: Menu, 3: Button
  path: string;
  component: string;
  icon: string;
  sort: number;
  children?: Menu[];
}

export interface CreateMenuDto {
  parentId?: number;
  name: string;
  code: string;
  type: number;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
}

export interface UpdateMenuDto extends Partial<CreateMenuDto> {}

export const menuApi = {
  findAll: async () => {
    const { data } = await api.get<Menu[]>('/menu');
    return data;
  },
  findOne: async (id: number) => {
    const { data } = await api.get<Menu>(`/menu/${id}`);
    return data;
  },
  create: async (data: CreateMenuDto) => {
    const { data: res } = await api.post<Menu>('/menu', data);
    return res;
  },
  update: async (id: number, data: UpdateMenuDto) => {
    const { data: res } = await api.put<Menu>(`/menu/${id}`, data);
    return res;
  },
  remove: async (id: number) => {
    await api.delete(`/menu/${id}`);
  },
  getMyMenus: async () => {
    const { data } = await api.get<Menu[]>('/menu/my-menus');
    return data;
  },
};
