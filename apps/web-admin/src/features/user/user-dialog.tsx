import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { roleApi } from '../role/api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { CreateUserDto, User } from './api';

const formSchema = z.object({
    username: z.string().min(1, '用户名必填'),
    nickname: z.string().optional(),
    password: z.string().optional(),
    email: z.string().min(1, '邮箱必填').email('邮箱格式不正确'),
    phone: z.string().optional(),
    status: z.coerce.number().default(1),
    roleIds: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User | null;
    onSubmit: (data: CreateUserDto) => Promise<void>;
}

export function UserDialog({
    open,
    onOpenChange,
    user,
    onSubmit,
}: UserDialogProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            username: '',
            nickname: '',
            password: '',
            email: '',
            phone: '',
            status: 1,
            roleIds: [],
        },
    });

    const { data: roles } = useQuery({
        queryKey: ['roles'],
        queryFn: roleApi.findAll,
    });

    useEffect(() => {
        if (open) {
            if (user) {
                form.reset({
                    username: user.username,
                    nickname: user.nickname || '',
                    password: '',
                    email: user.email || '',
                    phone: user.phone || '',
                    status: user.status,
                    roleIds: user.roles?.map((r) => String(r.id)) || [],
                });
            } else {
                form.reset({
                    username: '',
                    nickname: '',
                    password: '',
                    email: '',
                    phone: '',
                    status: 1,
                    roleIds: [],
                });
            }
        }
    }, [user, form, open]);

    const handleSubmit = async (values: FormValues) => {
        const submitData: CreateUserDto = {
            ...values,
            status: Number(values.status),
            roleIds: values.roleIds,
        };

        // 编辑时如果不填密码则不更新密码
        if (user && !values.password) {
            delete submitData.password;
        }

        await onSubmit(submitData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>{user ? '编辑用户' : '创建用户'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className='space-y-4'
                    >
                        <FormField
                            control={form.control}
                            name='username'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='after:content-["*"] after:ml-0.5 after:text-destructive'>
                                        用户名
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='请输入用户名'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {(!user || open) && (
                            <FormField
                                control={form.control}
                                name='password'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel
                                            className={
                                                !user
                                                    ? 'after:content-["*"] after:ml-0.5 after:text-destructive'
                                                    : ''
                                            }
                                        >
                                            {user
                                                ? '重置密码 (留空则不修改)'
                                                : '密码'}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type='password'
                                                placeholder={
                                                    user
                                                        ? '请输入新密码'
                                                        : '请输入密码'
                                                }
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className='grid grid-cols-2 gap-4'>
                            <FormField
                                control={form.control}
                                name='nickname'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>昵称</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='请输入昵称'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='status'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>状态</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={String(field.value)}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='选择状态' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='1'>
                                                    启用
                                                </SelectItem>
                                                <SelectItem value='0'>
                                                    禁用
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='after:content-["*"] after:ml-0.5 after:text-destructive'>
                                        邮箱
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='请输入邮箱'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='phone'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>手机号</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='请输入手机号'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='roleIds'
                            render={() => (
                                <FormItem>
                                    <FormLabel>角色分配</FormLabel>
                                    <div className='flex flex-wrap gap-4 p-3 rounded-md border'>
                                        {roles?.map((role) => (
                                            <FormField
                                                key={role.id}
                                                control={form.control}
                                                name='roleIds'
                                                render={({ field }) => {
                                                    const isChecked =
                                                        field.value?.includes(
                                                            String(role.id)
                                                        );
                                                    return (
                                                        <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={
                                                                        isChecked
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked
                                                                    ) => {
                                                                        const current =
                                                                            field.value ||
                                                                            [];
                                                                        const roleId =
                                                                            String(
                                                                                role.id
                                                                            );
                                                                        if (
                                                                            checked
                                                                        ) {
                                                                            field.onChange(
                                                                                [
                                                                                    ...current,
                                                                                    roleId,
                                                                                ]
                                                                            );
                                                                        } else {
                                                                            field.onChange(
                                                                                current.filter(
                                                                                    (
                                                                                        id
                                                                                    ) =>
                                                                                        id !==
                                                                                        roleId
                                                                                )
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className='text-sm font-normal cursor-pointer'>
                                                                {role.name}
                                                            </FormLabel>
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='flex gap-3 justify-end pt-4'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => onOpenChange(false)}
                            >
                                取消
                            </Button>
                            <Button type='submit'>保存</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
