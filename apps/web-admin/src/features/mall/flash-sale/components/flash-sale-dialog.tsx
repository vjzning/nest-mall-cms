import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { flashSaleApi, type CreateFlashSaleActivityDto } from '../api';
import { ContentPicker } from '@/components/content-picker';
import { ImagePicker } from '@/components/ui/image-picker';

interface FlashSaleDialogProps {
    id?: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function FlashSaleDialog({
    id,
    open,
    onOpenChange,
}: FlashSaleDialogProps) {
    const queryClient = useQueryClient();
    const isEdit = !!id;

    const { data: activity } = useQuery({
        queryKey: ['flash-sale-activity', id],
        queryFn: () => flashSaleApi.findOne(id!),
        enabled: open && isEdit,
    });

    const { reset, ...form } = useForm<CreateFlashSaleActivityDto>({
        defaultValues: {
            title: '',
            bannerUrl: '',
            startTime: '',
            endTime: '',
            status: 1,
            remark: '',
            products: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'products',
    });

    useEffect(() => {
        if (open && activity) {
            const formatToLocalISO = (dateStr: string) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                const offset = date.getTimezoneOffset() * 60000;
                const localISOTime = new Date(date.getTime() - offset)
                    .toISOString()
                    .slice(0, 16);
                return localISOTime;
            };

            reset({
                title: activity.title,
                bannerUrl: activity.bannerUrl || '',
                startTime: formatToLocalISO(activity.startTime),
                endTime: formatToLocalISO(activity.endTime),
                status: activity.status,
                remark: activity.remark || '',
                products:
                    activity.products?.map((p: any) => ({
                        productId: p.productId,
                        skuId: p.skuId,
                        flashPrice: p.flashPrice,
                        stock: p.stock,
                        limitPerUser: p.limitPerUser,
                        sort: p.sort,
                        _productName: p.product?.name,
                        _skuSpecs: p.sku?.specs,
                    })) || [],
            });
        } else if (open && !isEdit) {
            reset({
                title: '',
                bannerUrl: '',
                startTime: '',
                endTime: '',
                status: 1,
                remark: '',
                products: [],
            });
        }
    }, [open, activity, isEdit, reset]);

    const mutation = useMutation({
        mutationFn: (data: CreateFlashSaleActivityDto) =>
            isEdit ? flashSaleApi.update(id!, data) : flashSaleApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['flash-sale-activities'],
            });
            toast.success(isEdit ? '活动已更新' : '活动已创建');
            onOpenChange(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || '操作失败');
        },
    });

    const [contentPickerOpen, setContentPickerOpen] = useState(false);

    const handleContentSelect = (selected: any[]) => {
        selected.forEach((product) => {
            // 为该商品的所有 SKU 添加秒杀配置
            if (!product.skus || product.skus.length === 0) {
                toast.warning(`商品 ${product.name} 没有配置 SKU，已跳过`);
                return;
            }

            product.skus.forEach((sku: any) => {
                const exists = fields.some((f) => f.skuId === sku.id);
                if (!exists) {
                    append({
                        productId: product.id,
                        skuId: sku.id,
                        flashPrice: sku.price,
                        stock: 10,
                        limitPerUser: 1,
                        sort: 0,
                        // 额外信息用于展示，不提交给后端
                        _productName: product.name,
                        _skuSpecs: sku.specs,
                    });
                }
            });
        });
        setContentPickerOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-4xl max-h-[90vh] flex flex-col'>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? '编辑秒杀活动' : '新增秒杀活动'}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={form.handleSubmit((data) =>
                        mutation.mutate(data)
                    )}
                    className='overflow-y-auto pr-2 space-y-4'
                >
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                        <div className='md:col-span-1'>
                            <Label>活动海报</Label>
                            <div className='mt-2'>
                                <ImagePicker
                                    value={form.watch('bannerUrl') || ''}
                                    onChange={(url) =>
                                        form.setValue('bannerUrl', url)
                                    }
                                    className='w-full aspect-[4/3]'
                                    placeholder='选择海报'
                                />
                            </div>
                        </div>
                        <div className='space-y-4 md:col-span-3'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label>活动名称</Label>
                                    <Input
                                        {...form.register('title', {
                                            required: true,
                                        })}
                                        placeholder='请输入活动名称'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>活动状态</Label>
                                    <div className='flex items-center h-10'>
                                        <Switch
                                            checked={form.watch('status') === 1}
                                            onCheckedChange={(checked) =>
                                                form.setValue(
                                                    'status',
                                                    checked ? 1 : 0
                                                )
                                            }
                                        />
                                        <span className='ml-2 text-sm text-muted-foreground'>
                                            {form.watch('status') === 1
                                                ? '启用'
                                                : '禁用'}
                                        </span>
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label>开始时间</Label>
                                    <Input
                                        type='datetime-local'
                                        {...form.register('startTime', {
                                            required: true,
                                        })}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>结束时间</Label>
                                    <Input
                                        type='datetime-local'
                                        {...form.register('endTime', {
                                            required: true,
                                        })}
                                    />
                                </div>
                            </div>
                            <div className='space-y-2'>
                                <Label>备注</Label>
                                <Textarea
                                    {...form.register('remark')}
                                    placeholder='请输入活动备注'
                                    className='h-20'
                                />
                            </div>
                        </div>
                    </div>

                    <div className='space-y-4'>
                        <div className='flex justify-between items-center'>
                            <Label className='text-base font-semibold'>
                                秒杀商品配置
                            </Label>
                            <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => setContentPickerOpen(true)}
                            >
                                <Plus className='mr-2 w-4 h-4' />
                                添加商品
                            </Button>
                        </div>

                        <div className='rounded-md border'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>商品 SKU</TableHead>
                                        <TableHead className='w-[120px]'>
                                            秒杀价
                                        </TableHead>
                                        <TableHead className='w-[100px]'>
                                            库存
                                        </TableHead>
                                        <TableHead className='w-[100px]'>
                                            限购
                                        </TableHead>
                                        <TableHead className='w-[80px]'>
                                            排序
                                        </TableHead>
                                        <TableHead className='w-[50px]'></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell>
                                                <div className='flex flex-col gap-1'>
                                                    <div className='font-medium'>
                                                        {(field as any)
                                                            ._productName ||
                                                            '未知商品'}
                                                    </div>
                                                    <div className='text-xs text-muted-foreground'>
                                                        规格:{' '}
                                                        {JSON.stringify(
                                                            (field as any)
                                                                ._skuSpecs
                                                        ) || '-'}
                                                    </div>
                                                    <div className='text-[10px] text-muted-foreground'>
                                                        SKU ID: {field.skuId}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type='number'
                                                    step='0.01'
                                                    {...form.register(
                                                        `products.${index}.flashPrice`,
                                                        { valueAsNumber: true }
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type='number'
                                                    {...form.register(
                                                        `products.${index}.stock`,
                                                        { valueAsNumber: true }
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type='number'
                                                    {...form.register(
                                                        `products.${index}.limitPerUser`,
                                                        { valueAsNumber: true }
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type='number'
                                                    {...form.register(
                                                        `products.${index}.sort`,
                                                        { valueAsNumber: true }
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='icon'
                                                    className='text-destructive'
                                                    onClick={() =>
                                                        remove(index)
                                                    }
                                                >
                                                    <Trash2 className='w-4 h-4' />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {fields.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className='h-24 text-center text-muted-foreground'
                                            >
                                                请点击上方按钮添加秒杀商品
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <DialogFooter className='mt-4'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => onOpenChange(false)}
                        >
                            取消
                        </Button>
                        <Button type='submit' disabled={mutation.isPending}>
                            {mutation.isPending && (
                                <Loader2 className='mr-2 w-4 h-4 animate-spin' />
                            )}
                            保存
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            <ContentPicker
                open={contentPickerOpen}
                onOpenChange={setContentPickerOpen}
                type='product'
                selectionMode='multiple'
                onSelect={handleContentSelect}
                title='选择秒杀商品'
            />
        </Dialog>
    );
}
