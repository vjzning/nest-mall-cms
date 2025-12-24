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
      toast.success('User created');
    },
    onError: () => toast.error('Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateUserDto }) =>
      userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated');
    },
    onError: () => toast.error('Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: userApi.resetPassword,
    onSuccess: () => {
        toast.success('Password reset to 123456');
    },
    onError: () => toast.error('Failed to reset password'),
  });

  const handleCreate = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
      await deleteMutation.mutateAsync(id);
  };

  const handleResetPassword = async (id: number) => {
      await resetPasswordMutation.mutateAsync(id);
  };

  const handleSubmit = async (data: CreateUserDto) => {
    if (selectedUser) {
      await updateMutation.mutateAsync({ id: selectedUser.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  if (isLoading) return <div>Loading...</div>; // TODO: Replace with skeleton or just keep it as is, but ensure Suspense handles page level loading

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Nickname</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.nickname}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                    <div className="flex gap-1 flex-wrap">
                    {user.roles?.map(role => (
                        <Badge key={role.id} variant="secondary">{role.name}</Badge>
                    ))}
                    </div>
                </TableCell>
                <TableCell>
                    {user.status === 1 ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                    ) : (
                        <Badge variant="destructive">Disabled</Badge>
                    )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {user.username !== 'admin' && (
                        <>
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <PopoverConfirm
                                title="Delete User"
                                description="Are you sure you want to delete this user? This action cannot be undone."
                                onConfirm={() => handleDelete(user.id)}
                            >
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </PopoverConfirm>
                        </>
                      )}
                      <PopoverConfirm
                        title="Reset Password"
                        description="Are you sure you want to reset the password to 123456?"
                        onConfirm={() => handleResetPassword(user.id)}
                        confirmText="Reset"
                        variant="default"
                      >
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Lock className="mr-2 h-4 w-4" />
                            Reset Password
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
