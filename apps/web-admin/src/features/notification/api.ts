import { api } from '@/lib/axios';

export interface Notification {
  id: number;
  targetType: 'USER' | 'ADMIN';
  targetId: number;
  type: string;
  title: string;
  content: string;
  payload: any;
  isRead: number;
  createdAt: string;
}

export interface NotificationQuery {
  targetType?: 'USER' | 'ADMIN';
  targetId?: number;
  page?: number;
  limit?: number;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
}

export const notificationApi = {
  findAll: async (query: NotificationQuery) => {
    const { data } = await api.get<NotificationListResponse>('/notifications', { params: query });
    return data;
  },
  getUnreadCount: async (targetType: 'USER' | 'ADMIN', targetId: number) => {
    const { data } = await api.get<number>('/notifications/unread-count', {
      params: { targetType, targetId },
    });
    return data;
  },
  markAsRead: async (id: number) => {
    await api.put(`/notifications/${id}/read`);
  },
  markAllAsRead: async (targetType: 'USER' | 'ADMIN', targetId: number) => {
    await api.post('/notifications/read-all', { targetType, targetId });
  },
  // 通知设置
  findAllSettings: async () => {
    const { data } = await api.get<NotificationSetting[]>('/notification-settings');
    return data;
  },
  updateSetting: async (id: number, data: Partial<NotificationSetting>) => {
    const { data: res } = await api.put<NotificationSetting>(`/notification-settings/${id}`, data);
    return res;
  },
};

export interface NotificationSetting {
  id: number;
  type: string;
  channels: string[];
  isEnabled: boolean;
  description: string;
  adminEmails: string[];
  adminUserIds: number[];
}
