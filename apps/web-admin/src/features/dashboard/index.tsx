import React from 'react';
import { OverviewCards } from './components/overview-cards';
import { DashboardCharts } from './components/dashboard-charts';
import { DashboardAlerts } from './components/dashboard-alerts';

export const Dashboard = () => {
    return (
        <div className='flex flex-col gap-6'>
            <div className='flex justify-between items-center space-y-2'>
                <h2 className='text-3xl italic font-bold tracking-tight uppercase'>
                    Dashboard
                </h2>
            </div>

            <div className='space-y-6'>
                <OverviewCards />
                <DashboardCharts />
                <DashboardAlerts />
            </div>
        </div>
    );
};
