import { api } from '@/lib/axios';

export interface OverviewData {
  totalRevenue: number;
  pendingOrders: number;
  newMembers: number;
  activeProducts: number;
}

export interface SalesStat {
  date: string;
  revenue: number;
  orders: number;
}

export interface StatusStat {
  name: string;
  value: number;
  count: number;
}

export interface StatisticsData {
  salesData: SalesStat[];
  statusData: StatusStat[];
}

export interface RecentOrder {
  id: string;
  user: string;
  amount: string;
  status: string;
  time: string;
}

export interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

export interface AlertsData {
  recentOrders: RecentOrder[];
  lowStockItems: LowStockItem[];
}

export const dashboardApi = {
  getOverview: async () => {
    const { data } = await api.get<OverviewData>('/dashboard/overview');
    return data;
  },
  getStatistics: async () => {
    const { data } = await api.get<StatisticsData>('/dashboard/statistics');
    return data;
  },
  getAlerts: async () => {
    const { data } = await api.get<AlertsData>('/dashboard/alerts');
    return data;
  },
};
