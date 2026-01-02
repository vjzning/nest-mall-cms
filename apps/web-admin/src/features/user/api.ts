import { api } from '@/lib/axios';

export interface User {
    id: string;
    username: string;
    nickname: string;
    email: string;
    phone: string;
    status: number;
    roles?: Role[];
    created_at: string;
}

export interface Role {
    id: string;
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
    roleIds?: string[];
}

export type UpdateUserDto = Partial<CreateUserDto>;

export const userApi = {
    findAll: async () => {
        const { data } = await api.get<User[]>('/user');
        return data;
    },
    findOne: async (id: string) => {
        const { data } = await api.get<User>(`/user/${id}`);
        return data;
    },
    create: async (data: CreateUserDto) => {
        const { data: res } = await api.post<User>('/user', data);
        return res;
    },
    update: async (id: string, data: UpdateUserDto) => {
        const { data: res } = await api.put<User>(`/user/${id}`, data);
        return res;
    },
    remove: async (id: string) => {
        await api.delete(`/user/${id}`);
    },
    resetPassword: async (id: string) => {
        await api.post(`/user/${id}/reset-password`);
    },
};
