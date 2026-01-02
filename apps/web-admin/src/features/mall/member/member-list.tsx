import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi } from './api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Search,
    MoreHorizontal,
    UserMinus,
    UserCheck,
    Trash2,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PopoverConfirm } from '@/components/ui/popover-confirm';
import { toast } from 'sonner';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

export default function MemberList() {
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['members', page, keyword],
        queryFn: () => memberApi.findAll({ page, limit: 10, keyword }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            memberApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            toast.success('操作成功');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: memberApi.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            toast.success('删除成功');
        },
    });

    const toggleStatus = (id: number, currentStatus: number) => {
        updateMutation.mutate({
            id,
            data: { status: currentStatus === 1 ? 0 : 1 },
        });
    };

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

    if (isLoading) return <div>加载中...</div>;

    return (
        <div className='space-y-4'>
            <div className='flex justify-between items-center'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>
                        会员管理
                    </h2>
                    <p className='text-muted-foreground'>
                        管理商城注册会员信息
                    </p>
                </div>
            </div>

            <div className='flex items-center gap-2'>
                <div className='relative flex-1 max-w-sm'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='搜索用户名/昵称/手机号...'
                        className='pl-8'
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>会员</TableHead>
                            <TableHead>联系方式</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>注册时间</TableHead>
                            <TableHead className='w-[100px]'>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.items.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className='flex items-center gap-3'>
                                        <Avatar>
                                            <AvatarImage src={member.avatar} />
                                            <AvatarFallback>
                                                {member.nickname?.charAt(0) ||
                                                    member.username.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className='font-medium'>
                                                {member.nickname ||
                                                    '未设置昵称'}
                                            </div>
                                            <div className='text-sm text-muted-foreground'>
                                                @{member.username}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='text-sm'>
                                        <div>{member.phone || '-'}</div>
                                        <div className='text-muted-foreground'>
                                            {member.email || '-'}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            member.status === 1
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {member.status === 1 ? '正常' : '禁用'}
                                    </Badge>
                                </TableCell>
                                <TableCell className='text-sm'>
                                    {new Date(
                                        member.createdAt
                                    ).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant='ghost'
                                                className='h-8 w-8 p-0'
                                            >
                                                <MoreHorizontal className='h-4 w-4' />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align='end'>
                                            <DropdownMenuLabel>
                                                操作
                                            </DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    toggleStatus(
                                                        member.id,
                                                        member.status
                                                    )
                                                }
                                            >
                                                {member.status === 1 ? (
                                                    <>
                                                        <UserMinus className='mr-2 h-4 w-4' />{' '}
                                                        禁用
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserCheck className='mr-2 h-4 w-4' />{' '}
                                                        启用
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <PopoverConfirm
                                                title='删除会员'
                                                description='确定要删除该会员吗？此操作不可恢复。'
                                                onConfirm={() =>
                                                    deleteMutation.mutate(
                                                        member.id
                                                    )
                                                }
                                            >
                                                <DropdownMenuItem
                                                    onSelect={(e) =>
                                                        e.preventDefault()
                                                    }
                                                    className='text-red-600'
                                                >
                                                    <Trash2 className='mr-2 h-4 w-4' />{' '}
                                                    删除
                                                </DropdownMenuItem>
                                            </PopoverConfirm>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {data && data.totalPages > 1 && (
                <Pagination>
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
        </div>
    );
}
