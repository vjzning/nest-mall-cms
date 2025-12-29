import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export const DashboardAlerts = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-alerts'],
        queryFn: dashboardApi.getAlerts,
    });

    if (isLoading) {
        return (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
                <Skeleton className='col-span-4 h-[400px] rounded-xl' />
                <Skeleton className='col-span-3 h-[400px] rounded-xl' />
            </div>
        );
    }

    const recentOrders = data?.recentOrders || [];
    const lowStockItems = data?.lowStockItems || [];

    return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
            <Card className='col-span-4'>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>
                        The latest transactions from your store.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className='text-right'>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className='font-medium'>
                                        {order.id}
                                    </TableCell>
                                    <TableCell>{order.user}</TableCell>
                                    <TableCell>{order.amount}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                order.status === 'PENDING_PAY'
                                                    ? 'outline'
                                                    : order.status === 'PENDING_DELIVERY'
                                                      ? 'secondary'
                                                      : order.status === 'SHIPPED'
                                                        ? 'default'
                                                        : 'secondary'
                                            }
                                        >
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className='text-right text-xs text-muted-foreground'>
                                        {formatDistanceToNow(new Date(order.time), {
                                            addSuffix: true,
                                        })}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {recentOrders.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className='text-center py-10 text-muted-foreground'
                                    >
                                        No recent orders
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className='col-span-3'>
                <CardHeader>
                    <CardTitle className='flex items-center text-rose-500'>
                        <AlertCircle className='mr-2 w-4 h-4' />
                        Inventory Alerts
                    </CardTitle>
                    <CardDescription>
                        Items that are low in stock or sold out.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {lowStockItems.map((item) => (
                            <div
                                key={item.sku}
                                className='flex justify-between items-center pb-3 border-b last:border-0 last:pb-0'
                            >
                                <div className='space-y-1'>
                                    <p className='text-sm font-medium leading-none'>
                                        {item.name}
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        {item.sku}
                                    </p>
                                </div>
                                <div className='text-right'>
                                    <Badge
                                        variant={
                                            item.stock === 0
                                                ? 'destructive'
                                                : 'outline'
                                        }
                                        className='text-[10px]'
                                    >
                                        {item.stock === 0
                                            ? 'Out of Stock'
                                            : `${item.stock} left`}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                        {lowStockItems.length === 0 && (
                            <div className='text-center py-10 text-muted-foreground'>
                                All items are well stocked
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
