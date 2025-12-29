import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
} from 'recharts';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_COLORS: Record<string, string> = {
    COMPLETED: '#10b981',
    PENDING_PAY: '#f59e0b',
    PENDING_DELIVERY: '#3b82f6',
    SHIPPED: '#6366f1',
    DELIVERED: '#8b5cf6',
    CANCELLED: '#ef4444',
};

export const DashboardCharts = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-statistics'],
        queryFn: dashboardApi.getStatistics,
    });

    if (isLoading) {
        return (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
                <Skeleton className='col-span-4 h-[400px] rounded-xl' />
                <Skeleton className='col-span-3 h-[400px] rounded-xl' />
            </div>
        );
    }

    const salesData = data?.salesData || [];
    const statusData =
        data?.statusData.map((item) => ({
            ...item,
            color: STATUS_COLORS[item.name] || '#888888',
        })) || [];

    return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='col-span-4'>
                <CardHeader>
                    <CardTitle>Revenue Growth</CardTitle>
                    <CardDescription>
                        Daily revenue and order count for the last 7 days.
                    </CardDescription>
                </CardHeader>
                <CardContent className='pl-2'>
                    <div className='h-[300px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <AreaChart
                                data={salesData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id='colorRevenue'
                                        x1='0'
                                        y1='0'
                                        x2='0'
                                        y2='1'
                                    >
                                        <stop
                                            offset='5%'
                                            stopColor='#000'
                                            stopOpacity={0.1}
                                        />
                                        <stop
                                            offset='95%'
                                            stopColor='#000'
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray='3 3'
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey='date'
                                    stroke='#888888'
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke='#888888'
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `¥${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Area
                                    type='monotone'
                                    dataKey='revenue'
                                    stroke='#000'
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill='url(#colorRevenue)'
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className='col-span-3'>
                <CardHeader>
                    <CardTitle>Order Status</CardTitle>
                    <CardDescription>
                        Distribution of orders by their current status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='h-[300px] w-full'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx='50%'
                                    cy='50%'
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey='value'
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className='mt-4 grid grid-cols-2 gap-4 text-sm'>
                        {statusData.map((item) => (
                            <div key={item.name} className='flex items-center'>
                                <div
                                    className='w-3 h-3 rounded-full mr-2'
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className='text-muted-foreground truncate'>
                                    {item.name}
                                </span>
                                <span className='ml-auto font-medium'>
                                    {item.value}%
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
