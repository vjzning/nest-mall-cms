import { useForm, type FieldErrors } from 'react-hook-form';
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
import { roleApi, type CreateRoleDto, type Role } from './api';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menuApi } from '../menu/api';
import { Label } from '@/components/ui/label';
import { MenuTree } from './menu-tree';

const formSchema = z.object({
    name: z.string().min(1, '名称必填'),
    code: z.string().min(1, '编码必填'),
    description: z.string().optional(),
    menuIds: z.array(z.coerce.number()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role?: Role | null;
    onSubmit: (data: CreateRoleDto & { menuIds?: number[] }) => Promise<void>;
}

export function RoleDialog({
    open,
    onOpenChange,
    role,
    onSubmit,
}: RoleDialogProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: '',
            code: '',
            description: '',
            menuIds: [],
        },
    });

    const { data: menus } = useQuery({
        queryKey: ['menus'],
        queryFn: menuApi.findAll,
        enabled: open,
    });

    // Fetch full role details including permissions when role is provided
    const { data: roleDetails, isLoading: isLoadingRole } = useQuery({
        queryKey: ['role', role?.id],
        queryFn: () => roleApi.findOne(role!.id),
        enabled: !!role && open,
    });

    useEffect(() => {
        if (role) {
            // Use roleDetails if available, otherwise fallback to role (which might lack menus)
            // But roleDetails comes async, so this effect runs when roleDetails changes too
            const currentRole = roleDetails || role;

            form.reset({
                name: currentRole.name,
                code: currentRole.code,
                description: currentRole.description || '',
                menuIds: currentRole.menus?.map((m) => Number(m.id)) || [],
            });
        } else {
            form.reset({
                name: '',
                code: '',
                description: '',
                menuIds: [],
            });
        }
    }, [role, roleDetails, form, open]);

    const handleSubmit = async (values: FormValues) => {
        console.log('Form submitted:', values);
        try {
            await onSubmit(values);
            onOpenChange(false);
        } catch (e) {
            console.error('Submit error:', e);
        }
    };

    const onErrors = (errors: FieldErrors<FormValues>) => {
        console.log('Form errors:', errors);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[600px] max-h-[80vh] flex flex-col'>
                <DialogHeader>
                    <DialogTitle>{role ? '编辑角色' : '创建角色'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit, onErrors)}
                        className='flex overflow-hidden flex-col flex-1 space-y-4'
                    >
                        <div className='overflow-y-auto flex-1 pr-2'>
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>名称</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='角色名称'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='code'
                                render={({ field }) => (
                                    <FormItem className='mt-4'>
                                        <FormLabel>编码</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='角色编码'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='description'
                                render={({ field }) => (
                                    <FormItem className='mt-4'>
                                        <FormLabel>描述</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='角色描述'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className='mt-6'>
                                <Label>菜单权限</Label>
                                {isLoadingRole ? (
                                    <div className='mt-2 text-sm text-muted-foreground'>
                                        权限加载中...
                                    </div>
                                ) : (
                                    <div className='h-[300px] w-full rounded-md border p-4 mt-2 overflow-y-auto'>
                                        <FormField
                                            control={form.control}
                                            name='menuIds'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <MenuTree
                                                        menus={menus || []}
                                                        value={
                                                            field.value || []
                                                        }
                                                        onChange={
                                                            field.onChange
                                                        }
                                                    />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='pt-4 mt-auto border-t'>
                            <Button type='submit' className='w-full'>
                                保存
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
