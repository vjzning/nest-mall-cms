import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Edit } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

const STATUS_MAP: Record<string, string> = {
    PENDING_PAY: '待支付',
    PENDING_DELIVERY: '待发货',
    SHIPPED: '已发货',
    DELIVERED: '已送达',
    CANCELLED: '已取消',
    COMPLETED: '已完成',
};

export const DashboardAlerts = () => {
    const navigate = useNavigate();
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
                    <CardTitle>最近订单</CardTitle>
                    <CardDescription>商城最新的交易记录。</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>订单号</TableHead>
                                <TableHead>客户</TableHead>
                                <TableHead>金额</TableHead>
                                <TableHead>状态</TableHead>
                                <TableHead className='text-right'>
                                    时间
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className='font-medium text-xs'>
                                        {order.id}
                                    </TableCell>
                                    <TableCell>{order.user}</TableCell>
                                    <TableCell>¥{order.amount}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                order.status === 'PENDING_PAY'
                                                    ? 'outline'
                                                    : order.status ===
                                                        'PENDING_DELIVERY'
                                                      ? 'secondary'
                                                      : order.status ===
                                                          'SHIPPED'
                                                        ? 'default'
                                                        : 'secondary'
                                            }
                                        >
                                            {STATUS_MAP[order.status] ||
                                                order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className='text-right text-xs text-muted-foreground'>
                                        {formatDistanceToNow(
                                            new Date(order.time),
                                            {
                                                addSuffix: true,
                                                locale: zhCN,
                                            }
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {recentOrders.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className='text-center py-10 text-muted-foreground'
                                    >
                                        暂无最近订单
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
                        库存预警
                    </CardTitle>
                    <CardDescription>库存不足或已售罄的商品。</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {lowStockItems.map((item) => (
                            <div
                                key={item.sku}
                                className='group flex justify-between items-center pb-3 border-b last:border-0 last:pb-0'
                            >
                                <div className='space-y-1'>
                                    <p className='text-sm font-medium leading-none'>
                                        {item.name}
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        {item.sku}
                                    </p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Badge
                                        variant={
                                            item.stock === 0
                                                ? 'destructive'
                                                : 'outline'
                                        }
                                        className='text-[10px]'
                                    >
                                        {item.stock === 0
                                            ? '已售罄'
                                            : `剩余 ${item.stock} 件`}
                                    </Badge>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity'
                                        onClick={() =>
                                            navigate({
                                                to: `/mall/product/edit/${item.id}`,
                                            })
                                        }
                                        title='编辑商品'
                                    >
                                        <Edit className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {lowStockItems.length === 0 && (
                            <div className='text-center py-10 text-muted-foreground'>
                                所有商品库存充足
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
