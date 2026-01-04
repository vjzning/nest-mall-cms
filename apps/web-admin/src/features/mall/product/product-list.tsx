import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, deleteProduct } from './api';
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
import { PopoverConfirm } from '@/components/ui/popover-confirm';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Image as ImageIcon,
    Search,
    ChevronLeft,
    ChevronRight,
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

export default function ProductList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchName, setSearchName] = useState('');
    // Use a debounced value or just separate search trigger state if needed.
    // For simplicity, we trigger on enter or blur, or just pass directly if not too frequent.
    // Here I will use a separate state for the actual query to avoid refetch on every keystroke if desired,
    // but for admin panels, often "Enter to search" is preferred.
    const [queryName, setQueryName] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['products', page, pageSize, queryName],
        queryFn: () => getProducts({ page, limit: pageSize, name: queryName }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('商品已删除');
        },
        onError: () => {
            toast.error('删除失败');
        },
    });

    const handleSearch = () => {
        setPage(1);
        setQueryName(searchName);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    if (isLoading) {
        return (
            <div className='flex justify-center p-8'>
                <Loader2 className='animate-spin' />
            </div>
        );
    }

    const products = data?.items || [];
    const totalPages = data?.totalPages || 0;
    const total = data?.total || 0;

    return (
        <div className='flex flex-col gap-4 h-full'>
            <div className='flex justify-between items-center'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>
                        商品管理
                    </h2>
                    <p className='text-muted-foreground'>
                        管理商城商品及规格 (SKU)
                    </p>
                </div>
                <Button
                    onClick={() => navigate({ to: '/mall/product/create' })}
                >
                    <Plus className='mr-2 w-4 h-4' /> 添加商品
                </Button>
            </div>

            <div className='flex items-center gap-2 bg-background/95 p-1 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                <div className='relative flex-1 max-w-sm'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='搜索商品名称...'
                        className='pl-8'
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <Button variant='secondary' onClick={handleSearch}>
                    搜索
                </Button>
            </div>

            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-[80px]'>封面</TableHead>
                            <TableHead className='w-[300px]'>名称</TableHead>
                            <TableHead>价格</TableHead>
                            <TableHead>分类</TableHead>
                            <TableHead>销量</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>排序</TableHead>
                            <TableHead className='text-right'>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    {product.cover ? (
                                        <img
                                            src={product.cover}
                                            alt={product.name}
                                            className='w-12 h-12 object-cover rounded'
                                        />
                                    ) : (
                                        <div className='w-12 h-12 bg-muted rounded flex items-center justify-center'>
                                            <ImageIcon className='w-6 h-6 text-muted-foreground' />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className='font-medium'>
                                        {product.name}
                                    </div>
                                    <div className='text-xs text-muted-foreground truncate max-w-[250px]'>
                                        {product.description}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='font-medium text-destructive'>
                                        {product.price
                                            ? `￥${product.price}`
                                            : '-'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {product.category?.name || (
                                        <span className='text-muted-foreground'>
                                            -
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>{product.sales}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            product.status === 1
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {product.status === 1 ? '上架' : '下架'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{product.sort}</TableCell>
                                <TableCell className='text-right'>
                                    <div className='flex gap-2 justify-end'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='w-8 h-8'
                                            onClick={() =>
                                                navigate({
                                                    to: `/mall/product/edit/${product.id}`,
                                                })
                                            }
                                        >
                                            <Pencil className='w-4 h-4' />
                                        </Button>
                                        <PopoverConfirm
                                            title='确定删除商品吗？'
                                            description='此操作不可撤销。'
                                            onConfirm={async () => {
                                                await deleteMutation.mutateAsync(
                                                    product.id
                                                );
                                            }}
                                        >
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='w-8 h-8 text-destructive'
                                            >
                                                <Trash2 className='w-4 h-4' />
                                            </Button>
                                        </PopoverConfirm>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {products.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className='h-24 text-center text-muted-foreground'
                                >
                                    暂无商品数据
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className='flex items-center justify-between px-2'>
                <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                    <span>每页显示</span>
                    <Select
                        value={String(pageSize)}
                        onValueChange={(val) => {
                            setPageSize(Number(val));
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className='h-8 w-[70px]'>
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side='top'>
                            {[10, 20, 50, 100].map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span>条数据</span>
                    <span className='ml-2'>共 {total} 条</span>
                </div>

                <div className='flex items-center space-x-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className='h-4 w-4' />
                        上一页
                    </Button>
                    <div className='text-sm font-medium'>
                        第 {page} 页，共 {totalPages || 1} 页
                    </div>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page >= totalPages}
                    >
                        下一页
                        <ChevronRight className='h-4 w-4' />
                    </Button>
                </div>
            </div>
        </div>
    );
}
