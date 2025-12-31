import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrders, OrderStatus, getOrder } from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Loader2,
    Search,
    Eye,
    Truck,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from '@tanstack/react-router';
import { ShipDialog } from './ship-dialog';

const orderStatusMap: Record<string, { label: string; color: string }> = {
    [OrderStatus.PENDING_PAY]: {
        label: '待付款',
        color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    },
    [OrderStatus.PENDING_DELIVERY]: {
        label: '待发货',
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    [OrderStatus.PARTIALLY_SHIPPED]: {
        label: '部分发货',
        color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    },
    [OrderStatus.SHIPPED]: {
        label: '已发货',
        color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    },
    [OrderStatus.DELIVERED]: {
        label: '已送达',
        color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    },
    [OrderStatus.COMPLETED]: {
        label: '已完成',
        color: 'bg-green-500/10 text-green-500 border-green-500/20',
    },
    [OrderStatus.CANCELLED]: {
        label: '已取消',
        color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    },
};

export default function OrderList() {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [orderNo, setOrderNo] = useState('');
    const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');

    // Ship Dialog State
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);

    // Queries
    const { data, isLoading } = useQuery({
        queryKey: ['orders', page, pageSize, orderNo, status],
        queryFn: () =>
            getOrders({
                page,
                pageSize,
                orderNo: orderNo || undefined,
                status: status === 'ALL' ? undefined : status,
            }),
    });

    // Selected Order Detail Query (enabled when ship dialog is open)
    const { data: selectedOrder, isPending: isDetailLoading } = useQuery({
        queryKey: ['order', selectedOrderId],
        queryFn: () => getOrder(selectedOrderId!),
        enabled: !!selectedOrderId && isShipDialogOpen,
    });

    const handleSearch = () => {
        setPage(1);
    };

    const handleShip = (id: number) => {
        setSelectedOrderId(id);
        setIsShipDialogOpen(true);
    };

    const closeShipDialog = () => {
        setIsShipDialogOpen(false);
        setSelectedOrderId(null);
    };

    return (
        <div className='flex flex-col gap-4 h-full'>
            <div className='flex justify-between items-center'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>
                        订单管理
                    </h2>
                    <p className='text-muted-foreground'>查看和管理商城订单</p>
                </div>
            </div>

            <div className='flex items-center gap-2 bg-background/95 p-1 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                <div className='relative flex-1 max-w-sm'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='搜索订单号...'
                        className='pl-8'
                        value={orderNo}
                        onChange={(e) => setOrderNo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Select
                    value={status}
                    onValueChange={(val: OrderStatus | 'ALL') => setStatus(val)}
                >
                    <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder='订单状态' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='ALL'>全部状态</SelectItem>
                        {Object.values(OrderStatus).map((s) => (
                            <SelectItem key={s} value={s}>
                                {orderStatusMap[s]?.label || s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant='secondary' onClick={handleSearch}>
                    搜索
                </Button>
            </div>

            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>订单号</TableHead>
                            <TableHead>会员 ID</TableHead>
                            <TableHead>订单金额</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>创建时间</TableHead>
                            <TableHead className='text-right'>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className='h-24 text-center'
                                >
                                    <Loader2 className='inline-block animate-spin' />
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.items.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className='font-medium'>
                                        {order.orderNo}
                                    </TableCell>
                                    <TableCell>{order.memberId}</TableCell>
                                    <TableCell>¥{order.totalAmount}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant='outline'
                                            className={
                                                orderStatusMap[order.status]
                                                    ?.color
                                            }
                                        >
                                            {orderStatusMap[order.status]
                                                ?.label || order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(
                                            new Date(order.createdAt),
                                            'yyyy-MM-dd HH:mm'
                                        )}
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <div className='flex gap-2 justify-end'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                asChild
                                            >
                                                <Link
                                                    to='/mall/order/$id'
                                                    params={{
                                                        id: order.id.toString(),
                                                    }}
                                                >
                                                    <Eye className='w-4 h-4' />
                                                </Link>
                                            </Button>
                                            {(order.status ===
                                                OrderStatus.PENDING_DELIVERY ||
                                                order.status ===
                                                    OrderStatus.PARTIALLY_SHIPPED) && (
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={() =>
                                                        handleShip(order.id)
                                                    }
                                                >
                                                    <Truck className='w-4 h-4' />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                        {!isLoading && data?.items.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className='h-24 text-center text-muted-foreground'
                                >
                                    暂无订单数据
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className='flex justify-between items-center px-2'>
                <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                    <span>共 {data?.total || 0} 条数据</span>
                </div>
                <div className='flex items-center space-x-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className='w-4 h-4' />
                    </Button>
                    <div className='text-sm font-medium'>第 {page} 页</div>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page * pageSize >= (data?.total || 0)}
                    >
                        <ChevronRight className='w-4 h-4' />
                    </Button>
                </div>
            </div>

            {/* Ship Dialog */}
            <ShipDialog
                isOpen={isShipDialogOpen}
                onClose={closeShipDialog}
                order={selectedOrder}
                isLoading={isDetailLoading}
            />
        </div>
    );
}
