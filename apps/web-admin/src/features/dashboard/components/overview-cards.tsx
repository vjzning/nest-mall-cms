import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DollarSign,
    ShoppingBag,
    Users,
    Package,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';
import { Skeleton } from '@/components/ui/skeleton';

export const OverviewCards = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-overview'],
        queryFn: dashboardApi.getOverview,
    });

    const stats = [
        {
            title: '总营收',
            value: `¥${data?.totalRevenue?.toLocaleString() || '0'}`,
            icon: DollarSign,
            description: '累计总收入',
            trend: 'neutral',
            trendValue: '',
        },
        {
            title: '待处理订单',
            value: data?.pendingOrders.toString() || '0',
            icon: ShoppingBag,
            description: '待发货订单数',
            trend: 'neutral',
            trendValue: '',
        },
        {
            title: '新增会员',
            value: `+${data?.newMembers || 0}`,
            icon: Users,
            description: '最近 24 小时',
            trend: 'neutral',
            trendValue: '',
        },
        {
            title: '在售商品',
            value: data?.activeProducts.toString() || '0',
            icon: Package,
            description: '当前上架商品数',
            trend: 'neutral',
            trendValue: '',
        },
    ];

    if (isLoading) {
        return (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className='h-[120px] w-full rounded-xl' />
                ))}
            </div>
        );
    }

    return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            {stat.title}
                        </CardTitle>
                        <stat.icon className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{stat.value}</div>
                        <p className='text-xs text-muted-foreground flex items-center mt-1'>
                            {stat.trend === 'up' && (
                                <ArrowUpRight className='h-3 w-3 text-emerald-500 mr-1' />
                            )}
                            {stat.trend === 'down' && (
                                <ArrowDownRight className='h-3 w-3 text-rose-500 mr-1' />
                            )}
                            <span
                                className={
                                    stat.trend === 'up'
                                        ? 'text-emerald-500 font-medium'
                                        : stat.trend === 'down'
                                          ? 'text-rose-500 font-medium'
                                          : ''
                                }
                            >
                                {stat.trendValue}
                            </span>
                            <span className='ml-1'>{stat.description}</span>
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
