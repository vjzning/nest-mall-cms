import { api } from '@/lib/axios';

export interface DictType {
  id: number;
  name: string;
  code: string;
  status: number;
  remark?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DictData {
  id: number;
  typeCode: string;
  label: string;
  value: string;
  sort: number;
  isDefault: boolean;
  status: number;
  meta?: any;
  remark?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDictTypeDto {
  name: string;
  code: string;
  status?: number;
  remark?: string;
}

export interface UpdateDictTypeDto extends Partial<CreateDictTypeDto> {}

export interface CreateDictDataDto {
  typeCode: string;
  label: string;
  value: string;
  sort?: number;
  isDefault?: boolean;
  status?: number;
  meta?: any;
  remark?: string;
}

export interface UpdateDictDataDto extends Partial<CreateDictDataDto> {}

export const dictionaryApi = {
  // Type Operations
  findAllTypes: async () => {
    const { data } = await api.get<DictType[]>('/dictionary/type');
    return data;
  },
  
  createType: async (data: CreateDictTypeDto) => {
    const { data: res } = await api.post<DictType>('/dictionary/type', data);
    return res;
  },
  
  updateType: async (id: number, data: UpdateDictTypeDto) => {
    const { data: res } = await api.patch<DictType>(`/dictionary/type/${id}`, data);
    return res;
  },
  
  removeType: async (id: number) => {
    await api.delete(`/dictionary/type/${id}`);
  },

  // Data Operations
  getDataByType: async (typeCode: string) => {
    const { data } = await api.get<DictData[]>(`/dictionary/data/type/${typeCode}`);
    return data;
  },
  
  createData: async (data: CreateDictDataDto) => {
    const { data: res } = await api.post<DictData>('/dictionary/data', data);
    return res;
  },
  
  updateData: async (id: number, data: UpdateDictDataDto) => {
    const { data: res } = await api.patch<DictData>(`/dictionary/data/${id}`, data);
    return res;
  },
  
  removeData: async (id: number) => {
    await api.delete(`/dictionary/data/${id}`);
  },
};
