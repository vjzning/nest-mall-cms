import { api } from '@/lib/axios';

export interface Resource {
  id: number;
  originalName: string;
  filename: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  driver: string;
  uploader: {
    id: number;
    username: string;
    nickname?: string;
  };
  created_at: string;
}

export interface ResourceListResponse {
  items: Resource[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ResourceQueryParams {
  page?: number;
  limit?: number;
  filename?: string;
}

export const resourceApi = {
  findAll: async (params?: ResourceQueryParams) => {
    const { data } = await api.get<ResourceListResponse>('/resource', { params });
    return data;
  },

  remove: async (id: number) => {
    await api.delete(`/resource/${id}`);
  },

  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<Resource>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};
