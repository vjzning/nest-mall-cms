import React, { useState } from 'react';
import { OverviewCards } from './components/overview-cards';
import { DashboardCharts } from './components/dashboard-charts';
import { DashboardAlerts } from './components/dashboard-alerts';
import { QuickActions } from './components/quick-actions';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export const Dashboard = () => {
    const [dateRange, setDateRange] = useState('7d');
    const queryClient = useQueryClient();

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-statistics'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-alerts'] });
    };

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-4 justify-between items-start md:flex-row md:items-center'>
                <div>
                    <h2 className='text-3xl font-bold tracking-tight'>
                        仪表盘
                    </h2>
                    <p className='text-muted-foreground'>
                        欢迎回来，这是您的今日商城概览。
                    </p>
                </div>
                <div className='flex gap-2 items-center'>
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className='w-[150px]'>
                            <SelectValue placeholder='选择时间范围' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='today'>今日</SelectItem>
                            <SelectItem value='7d'>最近 7 天</SelectItem>
                            <SelectItem value='30d'>最近 30 天</SelectItem>
                            <SelectItem value='90d'>最近 90 天</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={handleRefresh}
                        title='刷新数据'
                    >
                        <RefreshCcw className='w-4 h-4' />
                    </Button>
                </div>
            </div>

            <div className='space-y-6'>
                <QuickActions />
                <OverviewCards />
                <DashboardCharts />
                <DashboardAlerts />
            </div>
        </div>
    );
};
