import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from './api';
import type { User, CreateUserDto } from './api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { UserDialog } from './user-dialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

import { PopoverConfirm } from '@/components/ui/popover-confirm';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Lock } from 'lucide-react';

export default function UserList() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: userApi.findAll,
    });

    const createMutation = useMutation({
        mutationFn: userApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('用户创建成功');
        },
        onError: () => toast.error('用户创建失败'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateUserDto }) =>
            userApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('用户更新成功');
        },
        onError: () => toast.error('用户更新失败'),
    });

    const deleteMutation = useMutation({
        mutationFn: userApi.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('用户删除成功');
        },
        onError: () => toast.error('用户删除失败'),
    });

    const resetPasswordMutation = useMutation({
        mutationFn: userApi.resetPassword,
        onSuccess: () => {
            toast.success('密码已重置为 123456');
        },
        onError: () => toast.error('重置密码失败'),
    });

    const handleCreate = () => {
        setSelectedUser(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        await deleteMutation.mutateAsync(id);
    };

    const handleResetPassword = async (id: string) => {
        await resetPasswordMutation.mutateAsync(id);
    };

    const handleSubmit = async (data: CreateUserDto) => {
        if (selectedUser) {
            await updateMutation.mutateAsync({ id: selectedUser.id, data });
        } else {
            await createMutation.mutateAsync(data);
        }
    };

    if (isLoading) return <div>加载中...</div>; // TODO: Replace with skeleton or just keep it as is, but ensure Suspense handles page level loading

    return (
        <div className='space-y-4'>
            <div className='flex justify-between items-center'>
                <h2 className='text-2xl font-bold tracking-tight'>用户管理</h2>
                <Button onClick={handleCreate}>
                    <Plus className='mr-2 h-4 w-4' /> 添加用户
                </Button>
            </div>

            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>用户名</TableHead>
                            <TableHead>昵称</TableHead>
                            <TableHead>邮箱</TableHead>
                            <TableHead>角色</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead className='text-right'>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.nickname}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <div className='flex gap-1 flex-wrap'>
                                        {user.roles?.map((role) => (
                                            <Badge
                                                key={role.id}
                                                variant='secondary'
                                            >
                                                {role.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {user.status === 1 ? (
                                        <Badge className='bg-green-500 hover:bg-green-600'>
                                            启用
                                        </Badge>
                                    ) : (
                                        <Badge variant='destructive'>
                                            禁用
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className='text-right'>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant='ghost'
                                                className='h-8 w-8 p-0'
                                            >
                                                <span className='sr-only'>
                                                    打开菜单
                                                </span>
                                                <MoreHorizontal className='h-4 w-4' />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align='end'>
                                            <DropdownMenuLabel>
                                                操作
                                            </DropdownMenuLabel>
                                            {user.username !== 'admin' && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleEdit(user)
                                                        }
                                                    >
                                                        <Pencil className='mr-2 h-4 w-4' />
                                                        编辑
                                                    </DropdownMenuItem>
                                                    <PopoverConfirm
                                                        title='删除用户'
                                                        description='确定要删除该用户吗？此操作不可撤销。'
                                                        onConfirm={() =>
                                                            handleDelete(
                                                                user.id
                                                            )
                                                        }
                                                    >
                                                        <DropdownMenuItem
                                                            onSelect={(e) =>
                                                                e.preventDefault()
                                                            }
                                                            className='text-red-600'
                                                        >
                                                            <Trash2 className='mr-2 h-4 w-4' />
                                                            删除
                                                        </DropdownMenuItem>
                                                    </PopoverConfirm>
                                                </>
                                            )}
                                            <PopoverConfirm
                                                title='重置密码'
                                                description='确定要将密码重置为 123456 吗？'
                                                onConfirm={() =>
                                                    handleResetPassword(user.id)
                                                }
                                                confirmText='重置'
                                                variant='default'
                                            >
                                                <DropdownMenuItem
                                                    onSelect={(e) =>
                                                        e.preventDefault()
                                                    }
                                                >
                                                    <Lock className='mr-2 h-4 w-4' />
                                                    重置密码
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

            <UserDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                user={selectedUser}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
