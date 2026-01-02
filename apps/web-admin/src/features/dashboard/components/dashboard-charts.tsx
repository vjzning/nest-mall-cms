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
    BarChart,
    Bar,
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

const STATUS_LABELS: Record<string, string> = {
    COMPLETED: '已完成',
    PENDING_PAY: '待支付',
    PENDING_DELIVERY: '待发货',
    SHIPPED: '已发货',
    DELIVERED: '已送达',
    CANCELLED: '已取消',
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
        data?.statusData?.map((item) => ({
            ...item,
            displayName: STATUS_LABELS[item.name] || item.name,
            color: STATUS_COLORS[item.name] || '#888888',
        })) || [];

    const categoryData = [
        { name: '数码配件', value: 400 },
        { name: '服装服饰', value: 300 },
        { name: '居家生活', value: 300 },
        { name: '美妆护肤', value: 200 },
        { name: '母婴用品', value: 278 },
        { name: '食品饮料', value: 189 },
    ];

    return (
        <div className='flex flex-col gap-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
                <Card className='col-span-4'>
                    <CardHeader>
                        <CardTitle>营收趋势</CardTitle>
                        <CardDescription>
                            最近 7 天的每日营收和订单量。
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
                                        labelFormatter={(label) =>
                                            `日期: ${label}`
                                        }
                                        formatter={(
                                            value: any,
                                            name: string
                                        ) => {
                                            if (name === 'revenue')
                                                return [`¥${value}`, '营收'];
                                            if (name === 'orders')
                                                return [value, '订单数'];
                                            return [value, name];
                                        }}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow:
                                                '0 4px 12px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                    <Area
                                        name='revenue'
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
                        <CardTitle>订单状态</CardTitle>
                        <CardDescription>
                            订单在各个状态下的分布比例。
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
                                        nameKey='displayName'
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(
                                            value: any,
                                            name: string
                                        ) => [`${value}%`, name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className='grid grid-cols-2 gap-4 mt-4 text-sm'>
                            {statusData.map((item) => (
                                <div
                                    key={item.name}
                                    className='flex items-center'
                                >
                                    <div
                                        className='mr-2 w-3 h-3 rounded-full'
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className='truncate text-muted-foreground'>
                                        {item.displayName}
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

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
                <Card className='col-span-7'>
                    <CardHeader>
                        <CardTitle>热销品类排行</CardTitle>
                        <CardDescription>
                            各品类商品的销售表现统计。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='h-[300px] w-full'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <BarChart data={categoryData}>
                                    <CartesianGrid
                                        strokeDasharray='3 3'
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey='name'
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
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow:
                                                '0 4px 12px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                    <Bar
                                        dataKey='value'
                                        fill='currentColor'
                                        radius={[4, 4, 0, 0]}
                                        className='fill-primary'
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
