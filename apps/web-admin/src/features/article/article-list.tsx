import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articleApi, type Article } from './api';
import { ArticleDialog } from './article-dialog';
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
    Search,
    Loader2,
    Eye,
    ThumbsUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export default function ArticleList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['articles', page, search, statusFilter],
        queryFn: () =>
            articleApi.findAll({
                page,
                limit: 10,
                title: search,
                status:
                    statusFilter === 'all' ? undefined : Number(statusFilter),
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: articleApi.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            toast.success('文章已删除');
        },
    });

    const renderPaginationItems = () => {
        if (!data) return null;
        const totalPages = data.totalPages;
        const items: React.ReactNode[] = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            items.push(
                <PaginationItem key='1'>
                    <PaginationLink
                        href='#'
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(1);
                        }}
                        isActive={page === 1}
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );
            if (startPage > 2) {
                items.push(
                    <PaginationItem key='start-ellipsis'>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
        }

        for (let p = startPage; p <= endPage; p++) {
            items.push(
                <PaginationItem key={p}>
                    <PaginationLink
                        href='#'
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                        }}
                        isActive={page === p}
                    >
                        {p}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push(
                    <PaginationItem key='end-ellipsis'>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        href='#'
                        onClick={(e) => {
                            e.preventDefault();
                            setPage(totalPages);
                        }}
                        isActive={page === totalPages}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    if (isLoading) {
        return (
            <div className='flex justify-center p-8'>
                <Loader2 className='animate-spin' />
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-4 h-full'>
            <div className='flex justify-between items-center'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>
                        文章管理
                    </h2>
                    <p className='text-muted-foreground'>管理博客文章和内容</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingArticle(null);
                        setDialogOpen(true);
                    }}
                >
                    <Plus className='mr-2 w-4 h-4' /> 添加文章
                </Button>
            </div>

            <div className='flex gap-4 items-center'>
                <div className='relative flex-1 max-w-sm'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='搜索文章标题...'
                        className='pl-8'
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder='筛选状态' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>所有状态</SelectItem>
                        <SelectItem value='0'>草稿</SelectItem>
                        <SelectItem value='1'>待审核</SelectItem>
                        <SelectItem value='2'>已发布</SelectItem>
                        <SelectItem value='4'>已下线</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-[450px]'>
                                文章内容
                            </TableHead>
                            <TableHead>分类</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>统计</TableHead>
                            <TableHead>创建时间</TableHead>
                            <TableHead className='text-right'>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.items.map((article) => (
                            <TableRow key={article.id}>
                                <TableCell>
                                    <div className='flex gap-3 items-start'>
                                        {article.cover ? (
                                            <div className='w-16 h-12 rounded overflow-hidden flex-shrink-0 border bg-muted'>
                                                <img
                                                    src={article.cover}
                                                    alt={article.title}
                                                    className='w-full h-full object-cover'
                                                />
                                            </div>
                                        ) : (
                                            <div className='w-16 h-12 rounded flex-shrink-0 border bg-muted flex items-center justify-center text-[10px] text-muted-foreground'>
                                                无封面
                                            </div>
                                        )}
                                        <div className='flex flex-col gap-1 min-w-0'>
                                            <span
                                                className='font-medium truncate block'
                                                title={article.title}
                                            >
                                                {article.title}
                                            </span>
                                            <div className='flex flex-wrap gap-1'>
                                                {article.isTop ? (
                                                    <Badge
                                                        variant='destructive'
                                                        className='text-[10px] h-4 px-1'
                                                    >
                                                        置顶
                                                    </Badge>
                                                ) : null}
                                                {article.isRecommend ? (
                                                    <Badge
                                                        variant='default'
                                                        className='text-[10px] h-4 px-1 bg-blue-500 hover:bg-blue-600'
                                                    >
                                                        推荐
                                                    </Badge>
                                                ) : null}
                                                {article.tags?.map((t) => (
                                                    <Badge
                                                        key={t.id}
                                                        variant='outline'
                                                        className='text-[10px] h-4 px-1'
                                                    >
                                                        {t.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {article.category?.name || '-'}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            article.status === 2
                                                ? 'default'
                                                : article.status === 0
                                                  ? 'secondary'
                                                  : article.status === 1
                                                    ? 'outline'
                                                    : 'destructive'
                                        }
                                    >
                                        {article.status === 0 && '草稿'}
                                        {article.status === 1 && '待审核'}
                                        {article.status === 2 && '已发布'}
                                        {article.status === 4 && '已下线'}
                                    </Badge>
                                </TableCell>
                                <TableCell className='text-xs text-muted-foreground'>
                                    <div className='flex gap-3 items-center'>
                                        <span
                                            className='flex gap-1 items-center'
                                            title='阅读量'
                                        >
                                            <Eye className='w-3 h-3' />{' '}
                                            {article.views}
                                        </span>
                                        <span
                                            className='flex gap-1 items-center'
                                            title='点赞数'
                                        >
                                            <ThumbsUp className='w-3 h-3' />{' '}
                                            {article.likes}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className='text-xs text-muted-foreground'>
                                    {new Date(
                                        article.createdAt
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className='text-right'>
                                    <div className='flex gap-2 justify-end'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='w-8 h-8'
                                            onClick={() => {
                                                setEditingArticle(article);
                                                setDialogOpen(true);
                                            }}
                                            title='编辑'
                                        >
                                            <Pencil className='w-4 h-4' />
                                        </Button>
                                        <PopoverConfirm
                                            title='确定删除这篇文章吗？'
                                            description='删除后将无法恢复。'
                                            onConfirm={() =>
                                                deleteMutation.mutateAsync(
                                                    article.id
                                                )
                                            }
                                        >
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='w-8 h-8 text-destructive'
                                                title='删除'
                                            >
                                                <Trash2 className='w-4 h-4' />
                                            </Button>
                                        </PopoverConfirm>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {data?.items.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className='h-24 text-center text-muted-foreground'
                                >
                                    未找到文章。
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {data && data.totalPages > 1 && (
                <Pagination className='mt-4'>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href='#'
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page > 1) setPage((p) => p - 1);
                                }}
                                className={
                                    page === 1
                                        ? 'pointer-events-none opacity-50'
                                        : 'cursor-pointer'
                                }
                            />
                        </PaginationItem>

                        {renderPaginationItems()}

                        <PaginationItem>
                            <PaginationNext
                                href='#'
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page < data.totalPages)
                                        setPage((p) => p + 1);
                                }}
                                className={
                                    page === data.totalPages
                                        ? 'pointer-events-none opacity-50'
                                        : 'cursor-pointer'
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            <ArticleDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                article={editingArticle}
            />
        </div>
    );
}
