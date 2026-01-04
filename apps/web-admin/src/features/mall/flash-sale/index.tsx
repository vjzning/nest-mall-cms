import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flashSaleApi, type FlashSaleActivity } from './api';
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
    PlayCircle,
    Calendar,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import FlashSaleDialog from './components/flash-sale-dialog';

export default function FlashSaleList() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | undefined>();

    const { data: activities, isLoading } = useQuery({
        queryKey: ['flash-sale-activities'],
        queryFn: () => flashSaleApi.findAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: flashSaleApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['flash-sale-activities'],
            });
            toast.success('活动已删除');
        },
    });

    const warmupMutation = useMutation({
        mutationFn: flashSaleApi.warmup,
        onSuccess: () => {
            toast.success('库存预热成功');
        },
        onError: () => {
            toast.error('预热失败');
        },
    });

    const handleCreate = () => {
        setSelectedId(undefined);
        setIsDialogOpen(true);
    };

    const handleEdit = (id: number) => {
        setSelectedId(id);
        setIsDialogOpen(true);
    };

    const getStatusBadge = (activity: FlashSaleActivity) => {
        const now = new Date();
        const start = new Date(activity.startTime);
        const end = new Date(activity.endTime);

        if (activity.status === 0)
            return <Badge variant='secondary'>已禁用</Badge>;
        if (now < start)
            return (
                <Badge
                    variant='outline'
                    className='text-blue-500 border-blue-500'
                >
                    未开始
                </Badge>
            );
        if (now > end) return <Badge variant='secondary'>已结束</Badge>;
        return <Badge className='bg-green-500'>进行中</Badge>;
    };

    if (isLoading) {
        return (
            <div className='flex justify-center items-center h-[400px]'>
                <Loader2 className='animate-spin w-8 h-8 text-primary' />
            </div>
        );
    }

    const data = activities || [];

    return (
        <div className='flex flex-col gap-4 h-full'>
            <div className='flex justify-between items-center'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>
                        秒杀管理
                    </h2>
                    <p className='text-muted-foreground'>
                        管理限时抢购及秒杀营销活动
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className='w-4 h-4 mr-2' />
                    新增活动
                </Button>
            </div>

            <div className='border rounded-md'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>活动名称</TableHead>
                            <TableHead>活动时间</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>备注</TableHead>
                            <TableHead>创建时间</TableHead>
                            <TableHead className='w-[150px]'>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((activity) => (
                            <TableRow key={activity.id}>
                                <TableCell className='font-medium'>
                                    {activity.title}
                                </TableCell>
                                <TableCell>
                                    <div className='flex flex-col text-xs text-muted-foreground'>
                                        <div className='flex items-center'>
                                            <Calendar className='w-3 h-3 mr-1' />
                                            {format(
                                                new Date(activity.startTime),
                                                'yyyy-MM-dd HH:mm'
                                            )}
                                        </div>
                                        <div className='flex items-center mt-1 text-red-400'>
                                            <AlertCircle className='w-3 h-3 mr-1' />
                                            {format(
                                                new Date(activity.endTime),
                                                'yyyy-MM-dd HH:mm'
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(activity)}
                                </TableCell>
                                <TableCell className='max-w-[200px] truncate'>
                                    {activity.remark || '-'}
                                </TableCell>
                                <TableCell className='text-muted-foreground'>
                                    {format(
                                        new Date(activity.createdAt),
                                        'yyyy-MM-dd HH:mm'
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className='flex items-center gap-2'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            onClick={() =>
                                                handleEdit(activity.id)
                                            }
                                            title='编辑'
                                        >
                                            <Pencil className='w-4 h-4' />
                                        </Button>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='text-orange-500 hover:text-orange-600 hover:bg-orange-50'
                                            onClick={() =>
                                                warmupMutation.mutate(
                                                    activity.id
                                                )
                                            }
                                            disabled={warmupMutation.isPending}
                                            title='预热库存到 Redis'
                                        >
                                            <PlayCircle className='w-4 h-4' />
                                        </Button>
                                        <PopoverConfirm
                                            title='删除确认'
                                            description='确定要删除该秒杀活动吗？'
                                            onConfirm={() =>
                                                deleteMutation.mutate(
                                                    activity.id
                                                )
                                            }
                                        >
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='text-destructive hover:text-destructive'
                                                title='删除'
                                            >
                                                <Trash2 className='w-4 h-4' />
                                            </Button>
                                        </PopoverConfirm>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className='h-24 text-center'
                                >
                                    暂无活动
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <FlashSaleDialog
                id={selectedId}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </div>
    );
}
