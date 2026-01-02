import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApi } from './api';
import type { Role, CreateRoleDto } from './api';
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
import { RoleDialog } from './role-dialog';
import { PopoverConfirm } from '@/components/ui/popover-confirm';
import { toast } from 'sonner';

export default function RoleList() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const { data: roles, isLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: roleApi.findAll,
    });

    const createMutation = useMutation({
        mutationFn: roleApi.create,
        onSuccess: () => {
            // queryClient.invalidateQueries({ queryKey: ['roles'] }); // We'll invalidate manually in handleSubmit to avoid double invalidation or race conditions
            toast.success('角色创建成功');
        },
        onError: () => toast.error('角色创建失败'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateRoleDto }) =>
            roleApi.update(id, data),
        onSuccess: () => {
            // queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success('角色更新成功');
        },
        onError: () => toast.error('角色更新失败'),
    });

    const deleteMutation = useMutation({
        mutationFn: roleApi.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success('角色删除成功');
        },
    });

    const handleCreate = () => {
        setSelectedRole(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        await deleteMutation.mutateAsync(id);
    };

    const handleSubmit = async (
        data: CreateRoleDto & { menuIds?: number[] }
    ) => {
        const { menuIds, ...roleData } = data;

        try {
            if (selectedRole) {
                await updateMutation.mutateAsync({
                    id: selectedRole.id,
                    data: roleData,
                });
                if (menuIds) {
                    await roleApi.assignPermissions(selectedRole.id, menuIds);
                }
            } else {
                const newRole = await createMutation.mutateAsync(roleData);
                if (newRole && menuIds && menuIds.length > 0) {
                    await roleApi.assignPermissions(newRole.id, menuIds);
                }
            }
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to save role', error);
            // Toast is already handled in mutation onError for role creation/update.
            // If assignPermissions fails, we should probably show an error too.
            if (
                selectedRole ||
                (error as any)?.response?.config?.url?.includes('permissions')
            ) {
                toast.error('分配权限失败');
            }
        }
    };

    if (isLoading) {
        return <div className='p-8 text-center'>加载中...</div>;
    }

    return (
        <div className='space-y-4'>
            <div className='flex justify-between items-center'>
                <h2 className='text-2xl font-bold tracking-tight'>角色管理</h2>
                <Button onClick={handleCreate}>
                    <Plus className='mr-2 h-4 w-4' /> 添加角色
                </Button>
            </div>

            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>名称</TableHead>
                            <TableHead>编码</TableHead>
                            <TableHead>描述</TableHead>
                            <TableHead className='text-right'>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles?.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell>{role.name}</TableCell>
                                <TableCell>{role.code}</TableCell>
                                <TableCell>{role.description}</TableCell>
                                <TableCell className='text-right'>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        onClick={() => handleEdit(role)}
                                    >
                                        <Pencil className='h-4 w-4' />
                                    </Button>
                                    <PopoverConfirm
                                        title='删除角色'
                                        description='确定要删除该角色吗？此操作不可撤销。'
                                        onConfirm={() => handleDelete(role.id)}
                                    >
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='text-red-500 hover:text-red-600'
                                        >
                                            <Trash2 className='h-4 w-4' />
                                        </Button>
                                    </PopoverConfirm>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <RoleDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                role={selectedRole}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
