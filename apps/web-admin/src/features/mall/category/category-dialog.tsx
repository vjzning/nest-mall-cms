import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mallCategoryApi, type MallCategory } from './api';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { ImagePicker } from '@/components/ui/image-picker';
import { TreeSelect } from '@/components/ui/tree-data-table';

const formSchema = z.object({
    name: z.string().min(1, '分类名称不能为空'),
    parentId: z.coerce.number().optional(),
    icon: z.string().optional(),
    pic: z.string().optional(),
    sort: z.coerce.number().min(0).default(0),
    status: z.coerce.number().default(1),
    isRecommend: z.coerce.number().default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface MallCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: MallCategory | null;
    parentId?: number;
}

export function MallCategoryDialog({
    open,
    onOpenChange,
    category,
    parentId,
}: MallCategoryDialogProps) {
    const queryClient = useQueryClient();

    const { data: categories } = useQuery({
        queryKey: ['mall-categories'],
        queryFn: mallCategoryApi.findAll,
        enabled: open,
    });

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema as any) as any,
        defaultValues: {
            name: '',
            sort: 0,
            status: 1,
            isRecommend: 0,
            parentId: 0,
        },
    });

    useEffect(() => {
        if (open) {
            if (category) {
                form.reset({
                    name: category.name,
                    parentId: category.parentId || 0,
                    icon: category.icon || '',
                    pic: category.pic || '',
                    sort: category.sort || 0,
                    status: category.status,
                    isRecommend: category.isRecommend,
                } as any);
            } else {
                form.reset({
                    name: '',
                    sort: 0,
                    status: 1,
                    isRecommend: 0,
                    parentId: parentId || 0,
                    icon: '',
                    pic: '',
                } as any);
            }
        }
    }, [open, category, parentId, form]);

    const mutation = useMutation({
        mutationFn: (values: FormValues) => {
            if (category) {
                return mallCategoryApi.update(category.id, values);
            }
            return mallCategoryApi.create(values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mall-categories'] });
            onOpenChange(false);
            toast.success(category ? '更新成功' : '创建成功');
        },
        onError: () => {
            toast.error('操作失败，请重试');
        },
    });

    function onSubmit(values: FormValues) {
        mutation.mutate(values);
    }

    // 过滤掉当前分类及其子分类，防止循环引用
    const filterSelf = (items: MallCategory[]): MallCategory[] => {
        return items
            .filter((item) => String(item.id) !== String(category?.id))
            .map((item) => ({
                ...item,
                children: item.children ? filterSelf(item.children) : [],
            }));
    };

    const parentOptions = categories ? filterSelf(categories) : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[600px]'>
                <DialogHeader>
                    <DialogTitle>
                        {category
                            ? '编辑商品分类'
                            : parentId
                              ? '添加子分类'
                              : '添加一级分类'}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit as any)}
                        className='space-y-4'
                    >
                        <div className='grid grid-cols-2 gap-4'>
                            <FormField
                                control={form.control as any}
                                name='parentId'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>上级分类</FormLabel>
                                        <FormControl>
                                            <TreeSelect
                                                options={[
                                                    {
                                                        id: 0,
                                                        name: '无 (一级分类)',
                                                    },
                                                    ...parentOptions,
                                                ]}
                                                value={field.value}
                                                onValueChange={(val) =>
                                                    field.onChange(Number(val))
                                                }
                                                placeholder='请选择上级分类'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>分类名称</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='请输入分类名称'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name='icon'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>图标 (Icon)</FormLabel>
                                        <FormControl>
                                            <ImagePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name='pic'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>大图 (Banner)</FormLabel>
                                        <FormControl>
                                            <ImagePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name='sort'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>排序</FormLabel>
                                        <FormControl>
                                            <Input type='number' {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            数值越大越靠前
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className='flex items-end gap-8 pb-4'>
                                <FormField
                                    control={form.control as any}
                                    name='status'
                                    render={({ field }) => (
                                        <FormItem className='flex items-center gap-2 space-y-0'>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value === 1}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        field.onChange(
                                                            checked ? 1 : 0
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormLabel className='font-normal cursor-pointer'>
                                                {field.value === 1
                                                    ? '启用'
                                                    : '禁用'}
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control as any}
                                    name='isRecommend'
                                    render={({ field }) => (
                                        <FormItem className='flex items-center gap-2 space-y-0'>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value === 1}
                                                    onCheckedChange={(
                                                        checked
                                                    ) =>
                                                        field.onChange(
                                                            checked ? 1 : 0
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormLabel className='font-normal cursor-pointer'>
                                                {field.value === 1
                                                    ? '推荐'
                                                    : '不推荐'}
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='flex justify-end gap-3 pt-4 border-t'>
                            <Button
                                variant='outline'
                                type='button'
                                onClick={() => onOpenChange(false)}
                            >
                                取消
                            </Button>
                            <Button type='submit' disabled={mutation.isPending}>
                                {mutation.isPending ? '保存中...' : '确定'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
