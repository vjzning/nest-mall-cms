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
  folderId?: number;
  uploader: {
    id: number;
    username: string;
    nickname?: string;
  };
  created_at: string;
}

export interface ResourceFolder {
  id: number;
  name: string;
  parentId?: number;
  sort: number;
  createdAt: string;
  updatedAt: string;
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
  folderId?: number;
}

export const resourceApi = {
  findAll: async (params?: ResourceQueryParams) => {
    // 后端资源列表接口在 /upload (GET)
    const { data } = await api.get<Resource[]>('/upload', { params });
    return {
        items: data,
        total: data.length,
        page: 1,
        limit: 1000,
        totalPages: 1
    };
  },

  remove: async (id: number) => {
    // TODO: 后端资源删除接口可能在 /resource 或 /upload，需确认
    await api.delete(`/resource/${id}`);
  },

  upload: async (file: File, folderId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
        formData.append('folderId', folderId.toString());
    }
    const { data } = await api.post<Resource>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // 目录相关接口
  findAllFolders: async (parentId?: number) => {
    const { data } = await api.get<ResourceFolder[]>('/resource-folders', {
        params: { parentId }
    });
    return data;
  },

  createFolder: async (name: string, parentId?: number) => {
    const { data } = await api.post<ResourceFolder>('/resource-folders', {
        name,
        parentId
    });
    return data;
  },

  updateFolder: async (id: number, name: string) => {
    const { data } = await api.patch<ResourceFolder>(`/resource-folders/${id}`, {
        name
    });
    return data;
  },

  removeFolder: async (id: number) => {
    await api.delete(`/resource-folders/${id}`);
  },

  moveResource: async (id: number, folderId?: number) => {
    const { data } = await api.patch(`/upload/${id}/move`, { folderId });
    return data;
  },
};
