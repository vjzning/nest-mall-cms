import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponApi, CouponType, CouponStatus } from './api';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PopoverConfirm } from '@/components/ui/popover-confirm';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from '@tanstack/react-router';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const couponTypeMap: Record<number, string> = {
    [CouponType.CASH]: '满减券',
    [CouponType.DISCOUNT]: '折扣券',
    [CouponType.FREE_POST]: '免邮券',
};

const couponStatusMap: Record<
    number,
    {
        label: string;
        variant: 'default' | 'secondary' | 'outline' | 'destructive';
    }
> = {
    [CouponStatus.OFF_SHELF]: { label: '未发布', variant: 'outline' },
    [CouponStatus.ACTIVE]: { label: '进行中', variant: 'default' },
    [CouponStatus.ENDED]: { label: '已结束', variant: 'secondary' },
};

export default function CouponList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [name, setName] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['coupons', page, pageSize, name],
        queryFn: () => couponApi.getCoupons({ page, limit: pageSize, name }),
    });

    const deleteMutation = useMutation({
        mutationFn: couponApi.deleteCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            toast.success('优惠券已删除');
        },
    });

    if (isLoading) {
        return (
            <div className='flex justify-center p-8'>
                <Loader2 className='animate-spin' />
            </div>
        );
    }

    const coupons = data?.data?.items || [];
    const total = data?.data?.total || 0;
    const totalPages = data?.data?.totalPages || 0;

    return (
        <div className='flex flex-col gap-4 h-full'>
            <div className='flex justify-between items-center'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>
                        优惠券管理
                    </h2>
                    <p className='text-muted-foreground'>
                        创建和管理商城优惠券、营销活动
                    </p>
                </div>
                <Button onClick={() => navigate({ to: '/mall/coupon/create' })}>
                    <Plus className='mr-2 w-4 h-4' /> 创建优惠券
                </Button>
            </div>

            <div className='flex items-center gap-2'>
                <div className='relative w-64'>
                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='搜索优惠券名称'
                        className='pl-8'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
            </div>

            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>名称</TableHead>
                            <TableHead>类型</TableHead>
                            <TableHead>面值/折扣</TableHead>
                            <TableHead>门槛</TableHead>
                            <TableHead>库存 (剩余/总量)</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>有效期</TableHead>
                            <TableHead className='text-right'>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className='text-center py-8 text-muted-foreground'
                                >
                                    暂无优惠券数据
                                </TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell className='font-medium'>
                                        {coupon.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant='outline'>
                                            {couponTypeMap[coupon.type]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {coupon.type === CouponType.DISCOUNT
                                            ? `${(coupon.value * 10).toFixed(1)} 折`
                                            : `¥${coupon.value}`}
                                    </TableCell>
                                    <TableCell>
                                        {coupon.minAmount > 0
                                            ? `满 ¥${coupon.minAmount}`
                                            : '无门槛'}
                                    </TableCell>
                                    <TableCell>
                                        {coupon.totalQuantity === -1
                                            ? '不限量'
                                            : `${coupon.remainingQuantity} / ${coupon.totalQuantity}`}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                couponStatusMap[coupon.status]
                                                    .variant
                                            }
                                        >
                                            {
                                                couponStatusMap[coupon.status]
                                                    .label
                                            }
                                        </Badge>
                                    </TableCell>
                                    <TableCell className='text-xs text-muted-foreground'>
                                        {coupon.validityType === 1
                                            ? `${new Date(coupon.startTime!).toLocaleDateString()} - ${new Date(coupon.endTime!).toLocaleDateString()}`
                                            : `领取后 ${coupon.validDays} 天有效`}
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <div className='flex justify-end gap-2'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={() =>
                                                    navigate({
                                                        to: `/mall/coupon/edit/${coupon.id}`,
                                                    })
                                                }
                                            >
                                                <Pencil className='w-4 h-4' />
                                            </Button>
                                            <PopoverConfirm
                                                title='确定删除此优惠券吗？'
                                                description='此操作不可撤销。'
                                                onConfirm={() =>
                                                    deleteMutation.mutate(
                                                        coupon.id
                                                    )
                                                }
                                            >
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='text-destructive'
                                                >
                                                    <Trash2 className='w-4 h-4' />
                                                </Button>
                                            </PopoverConfirm>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className='flex items-center justify-between mt-auto py-4'>
                <div className='text-sm text-muted-foreground'>
                    共 {total} 条记录
                </div>
                <div className='flex items-center gap-2'>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => {
                            setPageSize(Number(value));
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className='w-[100px]'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 50, 100].map((size) => (
                                <SelectItem key={size} value={size.toString()}>
                                    {size} 条/页
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className='flex items-center gap-1'>
                        <Button
                            variant='outline'
                            size='icon'
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            <ChevronLeft className='w-4 h-4' />
                        </Button>
                        <div className='text-sm font-medium px-2'>
                            {page} / {totalPages}
                        </div>
                        <Button
                            variant='outline'
                            size='icon'
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            <ChevronRight className='w-4 h-4' />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
