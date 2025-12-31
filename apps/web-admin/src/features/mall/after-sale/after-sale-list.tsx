import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { afterSaleApi, AfterSaleStatusMap, AfterSaleTypeMap } from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Loader2, Search, Eye } from 'lucide-react';
import { format } from 'date-fns';

const statusMap: Record<string, { label: string; color: string }> = {
    [AfterSaleStatusMap.APPLIED]: {
        label: '待审核',
        color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    },
    [AfterSaleStatusMap.APPROVED]: {
        label: '已通过',
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    [AfterSaleStatusMap.REJECTED]: {
        label: '已驳回',
        color: 'bg-red-500/10 text-red-500 border-red-500/20',
    },
    [AfterSaleStatusMap.WAITING_RECEIPT]: {
        label: '待收货',
        color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    },
    [AfterSaleStatusMap.PROCESSING]: {
        label: '处理中',
        color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    },
    [AfterSaleStatusMap.REFUNDED]: {
        label: '已退款',
        color: 'bg-green-500/10 text-green-500 border-green-500/20',
    },
    [AfterSaleStatusMap.COMPLETED]: {
        label: '已完成',
        color: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    },
    [AfterSaleStatusMap.CANCELLED]: {
        label: '已取消',
        color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    },
};

const typeMap: Record<
    number,
    {
        label: string;
        variant: 'outline' | 'default' | 'secondary' | 'destructive';
    }
> = {
    [AfterSaleTypeMap.REFUND_ONLY]: { label: '仅退款', variant: 'outline' },
    [AfterSaleTypeMap.RETURN_AND_REFUND]: {
        label: '退货退款',
        variant: 'secondary',
    },
    [AfterSaleTypeMap.EXCHANGE]: { label: '换货', variant: 'default' },
};

export default function AfterSaleList() {
    const navigate = useNavigate();
    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        status: undefined as any,
        afterSaleNo: '',
        orderNo: '',
    });

    const { data, isLoading } = useQuery({
        queryKey: ['after-sales', params],
        queryFn: () => afterSaleApi.findAll(params),
    });

    return (
        <div className='h-full flex flex-col gap-4'>
            <div className='flex justify-between items-center'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>
                        售后管理
                    </h2>
                    <p className='text-muted-foreground'>
                        处理用户退款、退货及换货申请
                    </p>
                </div>
            </div>

            <div className='flex gap-2 items-center bg-card p-4 rounded-lg border'>
                <div className='flex-1 flex gap-2'>
                    <Input
                        placeholder='售后单号'
                        value={params.afterSaleNo}
                        onChange={(e) =>
                            setParams({
                                ...params,
                                afterSaleNo: e.target.value,
                            })
                        }
                        className='max-w-[200px]'
                    />
                    <Input
                        placeholder='订单号'
                        value={params.orderNo}
                        onChange={(e) =>
                            setParams({ ...params, orderNo: e.target.value })
                        }
                        className='max-w-[200px]'
                    />
                    <Select
                        value={params.status}
                        onValueChange={(val) =>
                            setParams({
                                ...params,
                                status: val === 'all' ? undefined : val,
                            })
                        }
                    >
                        <SelectTrigger className='w-[150px]'>
                            <SelectValue placeholder='所有状态' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>所有状态</SelectItem>
                            {Object.values(AfterSaleStatusMap).map((val) => (
                                <SelectItem key={val} value={val}>
                                    {statusMap[val]?.label || val}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button variant='secondary'>
                    <Search className='mr-2 h-4 w-4' /> 搜索
                </Button>
            </div>

            <div className='border rounded-md'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>售后单号</TableHead>
                            <TableHead>关联订单</TableHead>
                            <TableHead>用户信息</TableHead>
                            <TableHead>售后类型</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>退款金额</TableHead>
                            <TableHead>申请时间</TableHead>
                            <TableHead className='text-right'>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className='h-24 text-center'
                                >
                                    <Loader2 className='h-6 w-6 animate-spin mx-auto' />
                                </TableCell>
                            </TableRow>
                        ) : data?.items.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className='h-24 text-center'
                                >
                                    暂无售后申请
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className='font-medium'>
                                        {item.afterSaleNo}
                                    </TableCell>
                                    <TableCell>{item.orderNo}</TableCell>
                                    <TableCell>
                                        <div className='flex flex-col'>
                                            <span>
                                                {item.member?.nickname ||
                                                    '未知用户'}
                                            </span>
                                            <span className='text-xs text-muted-foreground'>
                                                {item.member?.mobile}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                typeMap[item.type]?.variant ||
                                                'outline'
                                            }
                                        >
                                            {typeMap[item.type]?.label ||
                                                item.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant='outline'
                                            className={
                                                statusMap[item.status]?.color
                                            }
                                        >
                                            {statusMap[item.status]?.label ||
                                                item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>¥{item.applyAmount}</TableCell>
                                    <TableCell className='text-muted-foreground'>
                                        {format(
                                            new Date(item.createdAt),
                                            'yyyy-MM-dd HH:mm'
                                        )}
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            onClick={() =>
                                                navigate({
                                                    to: `/mall/after-sale/${item.id}` as any,
                                                })
                                            }
                                        >
                                            <Eye className='h-4 w-4' />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
