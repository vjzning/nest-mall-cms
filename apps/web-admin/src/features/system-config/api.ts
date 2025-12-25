import { api } from '@/lib/axios';

export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  group: string;
  isEncrypted: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConfigDto {
  key: string;
  value: string;
  group: string;
  isEncrypted: boolean;
  description?: string;
}

export interface UpdateConfigDto extends Partial<CreateConfigDto> {}

export const systemConfigApi = {
  findAll: async () => {
    const { data } = await api.get<SystemConfig[]>('/system-config');
    return data;
  },

  create: async (data: CreateConfigDto) => {
    const { data: res } = await api.post<SystemConfig>('/system-config', data);
    return res;
  },

  update: async (id: number, data: UpdateConfigDto) => {
    const { data: res } = await api.put<SystemConfig>(`/system-config/${id}`, data);
    return res;
  },

  remove: async (id: number) => {
    await api.delete(`/system-config/${id}`);
  },

  refreshCache: async () => {
    await api.post('/system-config/refresh');
  },
};
