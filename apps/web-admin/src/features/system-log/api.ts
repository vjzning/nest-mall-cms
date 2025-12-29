import { api } from '@/lib/axios';

export interface SystemLog {
  id: number;
  userId: number;
  userType: string;
  username: string;
  module: string;
  action: string;
  method: string;
  url: string;
  ip: string;
  location: string;
  params: string;
  body: string;
  response: string;
  status: number;
  errorMsg: string;
  duration: number;
  userAgent: string;
  createdAt: string;
}

export interface LogQuery {
  page?: number;
  limit?: number;
  username?: string;
  module?: string;
  status?: number;
}

export interface LogResponse {
  items: SystemLog[];
  total: number;
  page: number;
  limit: number;
}

export const systemLogApi = {
  findAll: async (query: LogQuery) => {
    const { data } = await api.get<LogResponse>('/system/logs', { params: query });
    return data;
  },
  findOne: async (id: number) => {
    const { data } = await api.get<SystemLog>(`/system/logs/${id}`);
    return data;
  },
};
