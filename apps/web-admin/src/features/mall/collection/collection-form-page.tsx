import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionApi } from './api';
import type { CollectionItem } from './api';
import { CollectionType, CollectionLayout } from '@app/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
    Trash2,
    Plus,
    ArrowLeft,
    Save,
    Image as ImageIcon,
    GripVertical,
    Search,
    Calendar as CalendarIcon,
    Loader2,
    ChevronUp,
    ChevronDown,
    Pencil,
    AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ImagePickerDialog } from '@/components/ui/image-picker-dialog';
import { ContentPicker, type ContentType } from '@/components/content-picker';
import { PopoverConfirm } from '@/components/ui/popover-confirm';

interface CollectionFormValues {
    code: string;
    type: CollectionType;
    title: string;
    subtitle: string;
    description: string;
    coverImage: string;
    layoutType: CollectionLayout;
    bgColor: string;
    status: number;
    sort: number;
    startAt: Date | null;
    endAt: Date | null;
    metadata: any;
    items: CollectionItem[];
}

export default function CollectionFormPage() {
    const navigate = useNavigate();
    const { id } = useParams({ strict: false }) as { id?: string };
    const isEdit = !!id;
    const queryClient = useQueryClient();

    const [coverPickerOpen, setCoverPickerOpen] = useState(false);
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
    const [contentPickerOpen, setContentPickerOpen] = useState(false);
    const [pickerType, setPickerType] = useState<ContentType>('product');
    const [isBulkAdd, setIsBulkAdd] = useState(false);

    const form = useForm<CollectionFormValues>({
        defaultValues: {
            code: '',
            type: undefined as any,
            title: '',
            subtitle: '',
            description: '',
            coverImage: '',
            layoutType: undefined as any,
            bgColor: '',
            status: 1,
            sort: 0,
            startAt: null,
            endAt: null,
            metadata: {},
            items: [],
        },
    });

    const { register, control, handleSubmit, setValue, watch, reset } = form;

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: 'items',
    });

    useEffect(() => {
        register('type', { required: true });
        register('layoutType', { required: true });
    }, [register]);

    const coverImage = watch('coverImage');
    const collectionType = watch('type');

    // Fetch data if edit
    const { data: collection, isLoading } = useQuery({
        queryKey: ['collection', id],
        queryFn: () => collectionApi.findOne(id!),
        enabled: isEdit,
    });

    useEffect(() => {
        if (collection) {
            reset({
                ...collection,
                items: (collection.items || []).map((item) => ({
                    ...item,
                    targetId: item.targetId ? Number(item.targetId) : 0,
                })),
                metadata: collection.metadata || {},
                startAt: collection.startAt
                    ? new Date(collection.startAt)
                    : null,
                endAt: collection.endAt ? new Date(collection.endAt) : null,
            });
        }
    }, [collection, reset]);

    const mutation = useMutation({
        mutationFn: (data: CollectionFormValues) =>
            isEdit
                ? collectionApi.update(id!, data)
                : collectionApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            toast.success(isEdit ? '更新成功' : '创建成功');
            navigate({ to: '/mall/collection' });
        },
        onError: (error: Error) => {
            toast.error(error.message || '操作失败');
        },
    });

    const onSubmit = (data: CollectionFormValues) => {
        mutation.mutate(data);
    };

    const handleImageSelect = (url: string) => {
        if (activeItemIndex !== null) {
            setValue(`items.${activeItemIndex}.imageOverride`, url);
            setActiveItemIndex(null);
        } else {
            setValue('coverImage', url);
        }
        setCoverPickerOpen(false);
    };

    const handleContentSelect = (selected: any[]) => {
        if (isBulkAdd) {
            selected.forEach((item) => {
                append({
                    targetId: Number(item.id),
                    titleOverride: item.title || item.name,
                    imageOverride: item.image || item.cover || item.coverImage,
                    sort: fields.length,
                });
            });
        } else if (activeItemIndex !== null) {
            const item = selected[0];
            setValue(`items.${activeItemIndex}.targetId`, Number(item.id));
            setValue(
                `items.${activeItemIndex}.titleOverride`,
                item.title || item.name
            );
            setValue(
                `items.${activeItemIndex}.imageOverride`,
                item.image || item.cover || item.coverImage
            );
        }
        setContentPickerOpen(false);
        setActiveItemIndex(null);
    };

    const openPicker = (
        type: ContentType,
        index: number | null = null,
        bulk = false
    ) => {
        setPickerType(type);
        setActiveItemIndex(index);
        setIsBulkAdd(bulk);
        setContentPickerOpen(true);
    };

    const getPickerType = (type: string): ContentType => {
        if (type === CollectionType.ARTICLE) return 'article';
        if (type === CollectionType.CATEGORY) return 'category';
        return 'product';
    };

    if (isEdit && isLoading) {
        return (
            <div className='flex items-center justify-center h-[400px]'>
                <Loader2 className='animate-spin text-muted-foreground' />
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className='relative pb-10 space-y-6'
        >
            <div className='flex items-center justify-between sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mt-8 -mx-8 px-8 border-b mb-6'>
                <div className='flex gap-4 items-center'>
                    <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => navigate({ to: '/mall/collection' })}
                    >
                        <ArrowLeft className='w-4 h-4' />
                    </Button>
                    <h2 className='text-2xl font-bold tracking-tight'>
                        {isEdit ? '编辑集合' : '新增集合'}
                    </h2>
                </div>
                <div className='flex gap-2'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => navigate({ to: '/mall/collection' })}
                    >
                        取消
                    </Button>
                    <Button type='submit' disabled={mutation.isPending}>
                        {mutation.isPending ? (
                            <Loader2 className='mr-2 w-4 h-4 animate-spin' />
                        ) : (
                            <Save className='mr-2 w-4 h-4' />
                        )}
                        保存
                    </Button>
                </div>
            </div>

            {Object.keys(form.formState.errors).length > 0 && (
                <div className='flex gap-3 items-start p-4 mb-6 rounded-lg border bg-destructive/10 border-destructive/20 text-destructive'>
                    <AlertCircle className='h-5 w-5 shrink-0 mt-0.5' />
                    <div className='space-y-1'>
                        <p className='font-medium'>
                            表单包含错误，请修正后再保存：
                        </p>
                        <ul className='text-sm list-disc list-inside opacity-90'>
                            {form.formState.errors.code && (
                                <li>唯一代码 (Code) 是必填项</li>
                            )}
                            {form.formState.errors.type && (
                                <li>集合类型是必填项</li>
                            )}
                            {form.formState.errors.title && (
                                <li>标题是必填项</li>
                            )}
                            {form.formState.errors.layoutType && (
                                <li>显示布局是必填项</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                <div className='space-y-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle>基本信息</CardTitle>
                            <CardDescription>
                                设置集合的显示标题、副标题和说明。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='code'>
                                        唯一代码 (Code){' '}
                                        <span className='text-destructive'>
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id='code'
                                        placeholder='如: HOME_BANNER, FLASH_SALE'
                                        className={cn(
                                            form.formState.errors.code &&
                                                'border-destructive'
                                        )}
                                        {...register('code', {
                                            required: true,
                                        })}
                                    />
                                    {form.formState.errors.code && (
                                        <p className='text-[0.8rem] font-medium text-destructive'>
                                            请输入唯一代码
                                        </p>
                                    )}
                                </div>
                                <div className='space-y-2'>
                                    <Label>
                                        集合类型{' '}
                                        <span className='text-destructive'>
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={watch('type')}
                                        onValueChange={(val) =>
                                            setValue('type', val as any, {
                                                shouldValidate: true,
                                            })
                                        }
                                    >
                                        <SelectTrigger
                                            className={cn(
                                                form.formState.errors.type &&
                                                    'border-destructive'
                                            )}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value={CollectionType.PRODUCT}
                                            >
                                                商品集合
                                            </SelectItem>
                                            <SelectItem
                                                value={CollectionType.CATEGORY}
                                            >
                                                分类集合
                                            </SelectItem>
                                            <SelectItem
                                                value={CollectionType.TOPIC}
                                            >
                                                专题集合
                                            </SelectItem>
                                            <SelectItem
                                                value={CollectionType.BRAND}
                                            >
                                                品牌集合
                                            </SelectItem>
                                            <SelectItem
                                                value={CollectionType.ARTICLE}
                                            >
                                                文章集合
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {form.formState.errors.type && (
                                        <p className='text-[0.8rem] font-medium text-destructive'>
                                            请选择集合类型
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='title'>
                                    标题{' '}
                                    <span className='text-destructive'>*</span>
                                </Label>
                                <Input
                                    id='title'
                                    placeholder='集合显示的名称'
                                    className={cn(
                                        form.formState.errors.title &&
                                            'border-destructive'
                                    )}
                                    {...register('title', { required: true })}
                                />
                                {form.formState.errors.title && (
                                    <p className='text-[0.8rem] font-medium text-destructive'>
                                        请输入标题
                                    </p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='subtitle'>副标题</Label>
                                <Input
                                    id='subtitle'
                                    placeholder='可选的辅助说明文字'
                                    {...register('subtitle')}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='description'>详细描述</Label>
                                <Textarea
                                    id='description'
                                    placeholder='集合的详细背景或规则说明'
                                    rows={3}
                                    {...register('description')}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label>配置信息 (JSON)</Label>
                                <Textarea
                                    className='font-mono text-sm min-h-[100px]'
                                    placeholder='{"key": "value"}'
                                    value={
                                        (() => {
                                            const metadata = watch('metadata');
                                            if (!metadata) return '';
                                            return typeof metadata === 'object'
                                                ? JSON.stringify(
                                                      metadata,
                                                      null,
                                                      2
                                                  )
                                                : String(metadata);
                                        })() as string
                                    }
                                    onChange={(e) => {
                                        try {
                                            const parsed = JSON.parse(
                                                e.target.value
                                            );
                                            setValue('metadata', parsed);
                                        } catch {
                                            setValue(
                                                'metadata',
                                                e.target.value as any
                                            );
                                        }
                                    }}
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label>开始时间</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant='outline'
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !watch('startAt') &&
                                                        'text-muted-foreground'
                                                )}
                                            >
                                                <CalendarIcon className='mr-2 w-4 h-4' />
                                                {watch('startAt')
                                                    ? format(
                                                          watch('startAt')!,
                                                          'PPP',
                                                          { locale: zhCN }
                                                      )
                                                    : '不限'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='p-0 w-auto'>
                                            <Calendar
                                                mode='single'
                                                selected={
                                                    watch('startAt') ||
                                                    undefined
                                                }
                                                onSelect={(date) =>
                                                    setValue(
                                                        'startAt',
                                                        date || null
                                                    )
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className='space-y-2'>
                                    <Label>结束时间</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant='outline'
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !watch('endAt') &&
                                                        'text-muted-foreground'
                                                )}
                                            >
                                                <CalendarIcon className='mr-2 w-4 h-4' />
                                                {watch('endAt')
                                                    ? format(
                                                          watch('endAt')!,
                                                          'PPP',
                                                          { locale: zhCN }
                                                      )
                                                    : '不限'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='p-0 w-auto'>
                                            <Calendar
                                                mode='single'
                                                selected={
                                                    watch('endAt') || undefined
                                                }
                                                onSelect={(date) =>
                                                    setValue(
                                                        'endAt',
                                                        date || null
                                                    )
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className='space-y-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle>外观设置</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='space-y-2'>
                                <Label>封面图片</Label>
                                <div
                                    className='flex overflow-hidden relative flex-col justify-center items-center rounded-md border-2 border-dashed transition-colors cursor-pointer aspect-video border-muted-foreground/25 hover:border-primary/50 group'
                                    onClick={() => {
                                        setActiveItemIndex(null);
                                        setCoverPickerOpen(true);
                                    }}
                                >
                                    {coverImage ? (
                                        <>
                                            <img
                                                src={coverImage}
                                                alt='Cover'
                                                className='object-cover w-full h-full'
                                            />
                                            <div className='flex absolute inset-0 justify-center items-center opacity-0 transition-opacity bg-black/40 group-hover:opacity-100'>
                                                <ImageIcon className='w-8 h-8 text-white' />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className='mb-2 w-8 h-8 text-muted-foreground' />
                                            <span className='text-xs text-muted-foreground'>
                                                点击选择图片
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label>
                                    显示布局{' '}
                                    <span className='text-destructive'>*</span>
                                </Label>
                                <Select
                                    value={watch('layoutType')}
                                    onValueChange={(val) =>
                                        setValue('layoutType', val as any, {
                                            shouldValidate: true,
                                        })
                                    }
                                >
                                    <SelectTrigger
                                        className={cn(
                                            form.formState.errors.layoutType &&
                                                'border-destructive'
                                        )}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value={CollectionLayout.GRID}
                                        >
                                            网格布局 (Grid)
                                        </SelectItem>
                                        <SelectItem
                                            value={CollectionLayout.CAROUSEL}
                                        >
                                            轮播布局 (Carousel)
                                        </SelectItem>
                                        <SelectItem
                                            value={CollectionLayout.SINGLE_HERO}
                                        >
                                            大图英雄 (Single Hero)
                                        </SelectItem>
                                        <SelectItem
                                            value={CollectionLayout.WATERFALL}
                                        >
                                            瀑布流 (Waterfall)
                                        </SelectItem>
                                        <SelectItem
                                            value={
                                                CollectionLayout.SPLIT_SCREEN
                                            }
                                        >
                                            分屏布局 (Split Screen)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.layoutType && (
                                    <p className='text-[0.8rem] font-medium text-destructive'>
                                        请选择显示布局
                                    </p>
                                )}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='bgColor'>背景颜色</Label>
                                <div className='flex gap-2'>
                                    <Input
                                        id='bgColor'
                                        placeholder='#FFFFFF'
                                        {...register('bgColor')}
                                    />
                                    <div
                                        className='w-10 h-10 rounded border shadow-sm cursor-pointer shrink-0'
                                        style={{
                                            backgroundColor:
                                                watch('bgColor') || '#fff',
                                        }}
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    'bg-color-picker'
                                                )
                                                ?.click()
                                        }
                                    />
                                    <input
                                        id='bg-color-picker'
                                        type='color'
                                        className='sr-only'
                                        value={
                                            watch('bgColor')?.startsWith('#')
                                                ? watch('bgColor')
                                                : '#ffffff'
                                        }
                                        onChange={(e) =>
                                            setValue('bgColor', e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className='flex justify-between items-center pt-2'>
                                <Label htmlFor='status'>立即启用</Label>
                                <Switch
                                    id='status'
                                    checked={watch('status') === 1}
                                    onCheckedChange={(checked) =>
                                        setValue('status', checked ? 1 : 0)
                                    }
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='sort'>排序权重</Label>
                                <Input
                                    id='sort'
                                    type='number'
                                    {...register('sort', {
                                        valueAsNumber: true,
                                    })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className='lg:col-span-2'>
                    <Card>
                        <CardHeader className='flex flex-row justify-between items-center space-y-0'>
                            <div>
                                <CardTitle>内容列表</CardTitle>
                                <CardDescription>
                                    管理集合中的具体内容项。
                                </CardDescription>
                            </div>
                            <div className='flex gap-2'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={() =>
                                        openPicker(
                                            getPickerType(collectionType),
                                            null,
                                            true
                                        )
                                    }
                                >
                                    <Search className='mr-2 w-4 h-4' /> 批量添加
                                </Button>
                                <Button
                                    type='button'
                                    size='sm'
                                    onClick={() =>
                                        append({
                                            targetId: 0,
                                            sort: fields.length,
                                        })
                                    }
                                >
                                    <Plus className='mr-2 w-4 h-4' /> 新增项
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className='rounded-md border'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className='w-[50px]'></TableHead>
                                            <TableHead>内容</TableHead>
                                            <TableHead className='w-[120px]'>
                                                排序 / 移动
                                            </TableHead>
                                            <TableHead className='w-[100px] text-right'>
                                                操作
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.map((field, index) => (
                                            <TableRow
                                                key={field.id}
                                                className='group'
                                            >
                                                <TableCell>
                                                    <GripVertical className='w-4 h-4 cursor-move text-muted-foreground' />
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex gap-3 items-center'>
                                                        <div
                                                            className='flex overflow-hidden relative justify-center items-center w-12 h-12 rounded border transition-colors cursor-pointer bg-muted shrink-0 hover:border-primary/50 group/img'
                                                            onClick={() => {
                                                                setActiveItemIndex(
                                                                    index
                                                                );
                                                                setCoverPickerOpen(
                                                                    true
                                                                );
                                                            }}
                                                        >
                                                            {watch(
                                                                `items.${index}.imageOverride`
                                                            ) ? (
                                                                <img
                                                                    src={watch(
                                                                        `items.${index}.imageOverride`
                                                                    )}
                                                                    className='object-cover w-full h-full'
                                                                />
                                                            ) : (
                                                                <ImageIcon className='w-5 h-5 text-muted-foreground' />
                                                            )}
                                                            <div className='flex absolute inset-0 justify-center items-center opacity-0 transition-opacity bg-black/40 group-hover/img:opacity-100'>
                                                                <Pencil className='w-4 h-4 text-white' />
                                                            </div>
                                                        </div>
                                                        <div className='flex-1 space-y-1 min-w-0'>
                                                            <Input
                                                                className='h-7 font-medium'
                                                                placeholder='标题 (留空则使用默认)'
                                                                {...register(
                                                                    `items.${index}.titleOverride`
                                                                )}
                                                            />
                                                            <div className='flex gap-2'>
                                                                <Input
                                                                    className='h-6 text-[10px] font-mono'
                                                                    placeholder='目标 ID'
                                                                    type='number'
                                                                    {...register(
                                                                        `items.${index}.targetId`,
                                                                        {
                                                                            valueAsNumber: true,
                                                                        }
                                                                    )}
                                                                />
                                                                <Input
                                                                    className='h-6 text-[10px]'
                                                                    placeholder='额外标签 (如: 热销, 新品)'
                                                                    {...register(
                                                                        `items.${index}.extraTag`
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type='button'
                                                            variant='ghost'
                                                            size='icon'
                                                            className='w-8 h-8 shrink-0'
                                                            onClick={() => {
                                                                setActiveItemIndex(
                                                                    index
                                                                );
                                                                openPicker(
                                                                    getPickerType(
                                                                        collectionType
                                                                    ),
                                                                    index
                                                                );
                                                            }}
                                                        >
                                                            <Search className='w-4 h-4' />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className='flex gap-1 items-center'>
                                                        <Input
                                                            type='number'
                                                            className='px-1 w-16 h-8 text-center'
                                                            {...register(
                                                                `items.${index}.sort`,
                                                                {
                                                                    valueAsNumber: true,
                                                                }
                                                            )}
                                                        />
                                                        <div className='flex flex-col'>
                                                            <Button
                                                                type='button'
                                                                variant='ghost'
                                                                size='icon'
                                                                className='w-4 h-4'
                                                                disabled={
                                                                    index === 0
                                                                }
                                                                onClick={() =>
                                                                    move(
                                                                        index,
                                                                        index -
                                                                            1
                                                                    )
                                                                }
                                                            >
                                                                <ChevronUp className='w-3 h-3' />
                                                            </Button>
                                                            <Button
                                                                type='button'
                                                                variant='ghost'
                                                                size='icon'
                                                                className='w-4 h-4'
                                                                disabled={
                                                                    index ===
                                                                    fields.length -
                                                                        1
                                                                }
                                                                onClick={() =>
                                                                    move(
                                                                        index,
                                                                        index +
                                                                            1
                                                                    )
                                                                }
                                                            >
                                                                <ChevronDown className='w-3 h-3' />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className='text-right'>
                                                    <PopoverConfirm
                                                        title='确认删除?'
                                                        description='此操作不可撤销。'
                                                        onConfirm={() =>
                                                            remove(index)
                                                        }
                                                    >
                                                        <Button
                                                            type='button'
                                                            variant='ghost'
                                                            size='icon'
                                                            className='w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                                                        >
                                                            <Trash2 className='w-4 h-4' />
                                                        </Button>
                                                    </PopoverConfirm>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {fields.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className='h-24 text-center text-muted-foreground'
                                                >
                                                    暂无内容，请点击上方按钮添加。
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ImagePickerDialog
                open={coverPickerOpen}
                onOpenChange={setCoverPickerOpen}
                onSelect={handleImageSelect}
            />

            <ContentPicker
                open={contentPickerOpen}
                onOpenChange={setContentPickerOpen}
                type={pickerType}
                selectionMode={isBulkAdd ? 'multiple' : 'single'}
                onSelect={handleContentSelect}
            />
        </form>
    );
}
