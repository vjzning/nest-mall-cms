import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionApi, type Collection } from './api';
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

const TYPE_LABELS: Record<string, string> = {
    product: '商品',
    category: '分类',
    topic: '专题',
    brand: '品牌',
    article: '文章',
};

const LAYOUT_LABELS: Record<string, string> = {
    grid: '网格',
    carousel: '轮播',
    single_hero: '大幅单图',
    waterfall: '瀑布流',
    split_screen: '分屏',
};

export default function CollectionList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [keyword, setKeyword] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['collections', page, pageSize, keyword],
        queryFn: () =>
            collectionApi.findAll({ page, limit: pageSize, keyword }),
    });

    const deleteMutation = useMutation({
        mutationFn: collectionApi.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            toast.success('集合已删除');
        },
    });

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-[400px]'>
                <Loader2 className='animate-spin text-muted-foreground' />
            </div>
        );
    }

    const collections = data?.items || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className='space-y-4'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>
                        内容集合
                    </h2>
                    <p className='text-muted-foreground text-sm'>
                        管理首页专题、轮播图和商品网格布局
                    </p>
                </div>
                <Button
                    onClick={() => navigate({ to: '/mall/collection/create' })}
                >
                    <Plus className='mr-2 w-4 h-4' /> 新增集合
                </Button>
            </div>

            <div className='flex items-center gap-2'>
                <div className='relative flex-1 max-w-sm'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='搜索代码或标题...'
                        className='pl-8'
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
            </div>

            <div className='rounded-md border bg-card'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-[120px]'>代码</TableHead>
                            <TableHead>标题/副标题</TableHead>
                            <TableHead className='w-[100px]'>类型</TableHead>
                            <TableHead className='w-[100px]'>布局</TableHead>
                            <TableHead className='w-[100px]'>状态</TableHead>
                            <TableHead className='w-[80px]'>排序</TableHead>
                            <TableHead className='text-right w-[120px]'>
                                操作
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {collections.map((col: Collection) => (
                            <TableRow key={col.id} className='group'>
                                <TableCell className='font-mono text-xs text-muted-foreground'>
                                    {col.code}
                                </TableCell>
                                <TableCell>
                                    <div className='flex flex-col'>
                                        <span className='font-medium'>
                                            {col.title}
                                        </span>
                                        {col.subtitle && (
                                            <span className='text-xs text-muted-foreground line-clamp-1'>
                                                {col.subtitle}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant='outline'
                                        className='font-normal'
                                    >
                                        {TYPE_LABELS[col.type] || col.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant='secondary'
                                        className='font-normal'
                                    >
                                        {LAYOUT_LABELS[col.layoutType] ||
                                            col.layoutType}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            col.status === 1
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className={
                                            col.status === 1
                                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                                : ''
                                        }
                                    >
                                        {col.status === 1 ? '启用' : '隐藏'}
                                    </Badge>
                                </TableCell>
                                <TableCell className='text-muted-foreground'>
                                    {col.sort}
                                </TableCell>
                                <TableCell className='text-right'>
                                    <div className='flex justify-end gap-1'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='h-8 w-8'
                                            onClick={() =>
                                                navigate({
                                                    to: `/mall/collection/edit/${col.id}`,
                                                })
                                            }
                                        >
                                            <Pencil className='w-4 h-4' />
                                        </Button>
                                        <PopoverConfirm
                                            title='删除集合'
                                            description='确定要删除该内容集合吗？此操作不可撤销。'
                                            onConfirm={() =>
                                                deleteMutation.mutate(col.id)
                                            }
                                        >
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                                            >
                                                <Trash2 className='w-4 h-4' />
                                            </Button>
                                        </PopoverConfirm>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {collections.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className='h-24 text-center text-muted-foreground'
                                >
                                    暂无数据
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className='flex items-center justify-between px-2'>
                <div className='flex-1 text-sm text-muted-foreground'>
                    共 {total} 条记录
                </div>
                <div className='flex items-center space-x-6 lg:space-x-8'>
                    <div className='flex items-center space-x-2'>
                        <p className='text-sm font-medium'>每页显示</p>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={(value) => {
                                setPageSize(Number(value));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className='h-8 w-[70px]'>
                                <SelectValue
                                    placeholder={pageSize.toString()}
                                />
                            </SelectTrigger>
                            <SelectContent side='top'>
                                {[10, 20, 30, 40, 50].map((size) => (
                                    <SelectItem
                                        key={size}
                                        value={size.toString()}
                                    >
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
                        第 {page} / {totalPages || 1} 页
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Button
                            variant='outline'
                            className='h-8 w-8 p-0'
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className='h-4 w-4' />
                        </Button>
                        <Button
                            variant='outline'
                            className='h-8 w-8 p-0'
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page === totalPages || totalPages === 0}
                        >
                            <ChevronRight className='h-4 w-4' />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
