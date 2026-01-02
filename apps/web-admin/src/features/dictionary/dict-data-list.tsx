import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dictionaryApi, type DictData, type DictType } from './api';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { PopoverConfirm } from '@/components/ui/popover-confirm';
import { Textarea } from '@/components/ui/textarea';

interface DictDataListProps {
    type: DictType;
}

const dataSchema = z.object({
    label: z.string().min(1, '标签必填'),
    value: z.string().min(1, '值必填'),
    sort: z.coerce.number().optional().default(0),
    isDefault: z.boolean().optional().default(false),
    status: z.coerce.number().optional().default(1),
    remark: z.string().optional(),
    meta: z
        .string()
        .optional()
        .refine((val) => {
            if (!val) return true;
            try {
                JSON.parse(val);
                return true;
            } catch {
                return false;
            }
        }, '必须是有效的 JSON 字符串'),
});

type DataFormValues = z.infer<typeof dataSchema>;

export function DictDataList({ type }: DictDataListProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingData, setEditingData] = useState<DictData | null>(null);
    const queryClient = useQueryClient();

    const { data: list, isLoading } = useQuery({
        queryKey: ['dict-data', type.code],
        queryFn: () => dictionaryApi.getDataByType(type.code),
        enabled: !!type.code,
    });

    const form = useForm<DataFormValues>({
        resolver: zodResolver(dataSchema),
        defaultValues: {
            label: '',
            value: '',
            sort: 0,
            isDefault: false,
            status: 1,
            remark: '',
            meta: '',
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: DataFormValues) => {
            const payload = {
                ...data,
                typeCode: type.code,
                meta: data.meta ? JSON.parse(data.meta) : undefined,
            };
            return dictionaryApi.createData(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['dict-data', type.code],
            });
            setIsOpen(false);
            form.reset();
            toast.success('字典数据项创建成功');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: DataFormValues }) => {
            const payload = {
                ...data,
                meta: data.meta ? JSON.parse(data.meta) : undefined,
            };
            return dictionaryApi.updateData(id, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['dict-data', type.code],
            });
            setIsOpen(false);
            setEditingData(null);
            form.reset();
            toast.success('字典数据项更新成功');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: dictionaryApi.removeData,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['dict-data', type.code],
            });
            toast.success('字典数据项删除成功');
        },
    });

    const handleSubmit = (data: DataFormValues) => {
        if (editingData) {
            updateMutation.mutate({ id: editingData.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (item: DictData) => {
        setEditingData(item);
        form.reset({
            label: item.label,
            value: item.value,
            sort: item.sort,
            isDefault: item.isDefault,
            status: item.status,
            remark: item.remark,
            meta: item.meta ? JSON.stringify(item.meta, null, 2) : '',
        });
        setIsOpen(true);
    };

    if (isLoading) {
        return (
            <div className='flex justify-center p-8'>
                <Loader2 className='animate-spin' />
            </div>
        );
    }

    return (
        <div className='flex flex-col h-full'>
            <div className='flex justify-between items-center p-4 border-b bg-muted/20'>
                <div>
                    <h3 className='flex gap-2 items-center font-semibold'>
                        {type.name}
                        <Badge variant='outline' className='font-mono text-xs'>
                            {type.code}
                        </Badge>
                    </h3>
                    <p className='mt-1 text-xs text-muted-foreground'>
                        {type.remark || '管理字典数据项'}
                    </p>
                </div>
                <Button
                    size='sm'
                    onClick={() => {
                        setEditingData(null);
                        form.reset({
                            label: '',
                            value: '',
                            sort: 0,
                            isDefault: false,
                            status: 1,
                            remark: '',
                            meta: '',
                        });
                        setIsOpen(true);
                    }}
                >
                    <Plus className='mr-1 w-4 h-4' /> 添加数据
                </Button>
            </div>

            <div className='overflow-auto flex-1 p-4'>
                <div className='rounded-md border'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[80px]'>排序</TableHead>
                                <TableHead>标签</TableHead>
                                <TableHead>数据值</TableHead>
                                <TableHead className='w-[100px]'>
                                    默认
                                </TableHead>
                                <TableHead className='w-[100px]'>
                                    状态
                                </TableHead>
                                <TableHead className='w-[100px] text-right'>
                                    操作
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {list?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.sort}</TableCell>
                                    <TableCell className='font-medium'>
                                        {item.label}
                                    </TableCell>
                                    <TableCell className='font-mono text-xs'>
                                        {item.value}
                                    </TableCell>
                                    <TableCell>
                                        {item.isDefault && (
                                            <Badge variant='secondary'>
                                                默认
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                item.status === 1
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                        >
                                            {item.status === 1
                                                ? '正常'
                                                : '禁用'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <div className='flex gap-2 justify-end'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='w-8 h-8'
                                                onClick={() => handleEdit(item)}
                                            >
                                                <Pencil className='w-4 h-4' />
                                            </Button>
                                            <PopoverConfirm
                                                onConfirm={() =>
                                                    deleteMutation.mutateAsync(
                                                        item.id
                                                    )
                                                }
                                                title='删除数据项？'
                                                description='此操作无法撤销。'
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
                            {list?.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className='h-24 text-center text-muted-foreground'
                                    >
                                        未找到数据。请添加一个。
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingData ? '编辑数据' : '添加数据'}
                        </DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className='space-y-4'
                    >
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>标签</Label>
                                <Input
                                    {...form.register('label')}
                                    placeholder='显示名称'
                                />
                                {form.formState.errors.label && (
                                    <p className='text-sm text-destructive'>
                                        {form.formState.errors.label.message}
                                    </p>
                                )}
                            </div>
                            <div className='space-y-2'>
                                <Label>数据值</Label>
                                <Input
                                    {...form.register('value')}
                                    placeholder='存储值'
                                />
                                {form.formState.errors.value && (
                                    <p className='text-sm text-destructive'>
                                        {form.formState.errors.value.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>排序</Label>
                                <Input
                                    type='number'
                                    {...form.register('sort')}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>备注</Label>
                                <Input {...form.register('remark')} />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label>元数据 (JSON)</Label>
                            <Textarea
                                {...form.register('meta')}
                                placeholder='{"key": "value"}'
                                className='font-mono text-xs'
                                rows={3}
                            />
                            {form.formState.errors.meta && (
                                <p className='text-sm text-destructive'>
                                    {form.formState.errors.meta.message}
                                </p>
                            )}
                        </div>

                        <div className='flex gap-8 items-center py-2'>
                            <div className='flex items-center space-x-2'>
                                <Switch
                                    checked={form.watch('isDefault')}
                                    onCheckedChange={(checked) =>
                                        form.setValue('isDefault', checked)
                                    }
                                />
                                <Label>设为默认</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Switch
                                    checked={form.watch('status') === 1}
                                    onCheckedChange={(checked) =>
                                        form.setValue('status', checked ? 1 : 0)
                                    }
                                />
                                <Label>启用</Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => setIsOpen(false)}
                            >
                                取消
                            </Button>
                            <Button
                                type='submit'
                                disabled={
                                    createMutation.isPending ||
                                    updateMutation.isPending
                                }
                            >
                                {(createMutation.isPending ||
                                    updateMutation.isPending) && (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                )}
                                保存
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
