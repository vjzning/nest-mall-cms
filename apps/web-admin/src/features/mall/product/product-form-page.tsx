import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getProduct,
    createProduct,
    updateProduct,
    type CreateProductDto,
    type ProductSku,
} from './api';
import { categoryApi } from '@/features/category/api';
import { getShippingTemplates } from '../shipping-template/api';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Trash2,
    Plus,
    ArrowLeft,
    Save,
    Image as ImageIcon,
    X,
    ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { TreeSelect } from '@/components/ui/tree-data-table';
import { ImagePickerDialog } from '@/components/ui/image-picker-dialog';

interface SpecDef {
    name: string;
    values: string[];
}

export default function ProductFormPage() {
    const navigate = useNavigate();
    // We need to parse ID from URL. Since I'm not using the route component directly here but exporting it,
    // I'll assume the wrapper route passes the ID or I use useParams.
    // But standard TanStack router uses hooks.
    // Let's assume this component is used in a route that parses params.
    const { id } = useParams({ strict: false }) as { id?: string };
    const isEdit = !!id;

    const [activeTab, setActiveTab] = useState('basic');
    const [specs, setSpecs] = useState<SpecDef[]>([]);
    const [isSingleProduct, setIsSingleProduct] = useState(true);
    const [coverPickerOpen, setCoverPickerOpen] = useState(false);
    const [imagePickerOpen, setImagePickerOpen] = useState(false);

    const queryClient = useQueryClient();

    const form = useForm<CreateProductDto>({
        defaultValues: {
            name: '',
            description: '',
            status: 1,
            sort: 0,
            skus: [],
            images: [],
            cover: '',
            detail: '',
            shippingTemplateId: undefined,
            weight: 0,
            volume: 0,
        },
    });

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = form;
    const { fields: skuFields, replace: replaceSkus } = useFieldArray({
        control,
        name: 'skus',
    });

    const cover = watch('cover');
    const images = watch('images') || [];

    // Fetch product if edit
    const { data: product } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProduct(Number(id)),
        enabled: isEdit,
    });

    // Fetch categories
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryApi.findAll,
    });

    // Fetch shipping templates
    const { data: shippingTemplatesData } = useQuery({
        queryKey: ['shipping-templates'],
        queryFn: () => getShippingTemplates(),
    });
    const shippingTemplates = shippingTemplatesData?.items || [];

    useEffect(() => {
        if (product) {
            reset({
                name: product.name,
                description: product.description,
                categoryId: product.categoryId,
                cover: product.cover,
                images: product.images,
                detail: product.detail,
                status: product.status,
                sort: product.sort,
                skus: product.skus || [],
                shippingTemplateId: product.shippingTemplateId,
                weight: product.weight,
                volume: product.volume,
            });

            // Try to reverse engineer specs from SKUs if possible,
            // otherwise user has to manually rebuild specs or we just show SKUs table.
            // For simplicity in this demo, if editing, we might load SKUs directly into table
            // but "Rebuilding Specs" from Cartesian product is hard if not stored separately.
            // We stored 'specs' in SKU json. We can try to aggregate.
            if (product.skus && product.skus.length > 0) {
                const aggregated: Record<string, Set<string>> = {};
                product.skus.forEach((sku) => {
                    if (Array.isArray(sku.specs)) {
                        sku.specs.forEach((s: any) => {
                            if (!aggregated[s.key])
                                aggregated[s.key] = new Set();
                            aggregated[s.key].add(s.value);
                        });
                    }
                });
                const recoveredSpecs = Object.entries(aggregated).map(
                    ([name, values]) => ({
                        name,
                        values: Array.from(values),
                    })
                );
                setSpecs(recoveredSpecs);
                setIsSingleProduct(recoveredSpecs.length === 0);
            } else {
                setIsSingleProduct(true);
            }
        }
    }, [product, reset]);

    const mutation = useMutation({
        mutationFn: (data: CreateProductDto) =>
            isEdit ? updateProduct(Number(id), data) : createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success(`商品${isEdit ? '已更新' : '已创建'}`);
            navigate({ to: '/mall/product' });
        },
        onError: (err) => {
            toast.error('保存商品失败');
            console.error(err);
        },
    });

    useEffect(() => {
        if (isSingleProduct && skuFields.length === 0) {
            replaceSkus([
                {
                    code: 'default',
                    specs: [],
                    price: 0,
                    stock: 0,
                    marketPrice: 0,
                },
            ]);
        }
    }, [isSingleProduct, replaceSkus, skuFields.length]);

    const onSubmit = (data: CreateProductDto) => {
        mutation.mutate(data);
    };

    // SKU Generator Logic
    const generateSkus = () => {
        if (specs.length === 0) return;

        // Cartesian product
        const cartesian = (...a: any[][]) =>
            a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));

        // values array: [['Red', 'Blue'], ['S', 'M']]
        const valuesArrays = specs.map((s) => s.values);
        if (valuesArrays.some((v) => v.length === 0)) return;

        const combinations =
            specs.length === 1
                ? valuesArrays[0].map((v) => [v])
                : cartesian(...valuesArrays);

        const newSkus: ProductSku[] = combinations.map((combo: string[]) => {
            const specObj = combo.map((val, idx) => ({
                key: specs[idx].name,
                value: val,
            }));
            const code = combo.join('-');
            // Check if existing SKU matches to preserve price/stock
            const existing = skuFields.find((f) => {
                // Simple check: if code matches or specs match
                // Ideally check specs deep equality
                return f.code === code; // Assuming code is auto-generated in same way
            });

            return (
                existing || {
                    code,
                    specs: specObj,
                    price: 0,
                    stock: 0,
                    marketPrice: 0,
                }
            );
        });

        replaceSkus(newSkus);
    };

    // Spec handlers
    const addSpec = () => {
        setSpecs([...specs, { name: '', values: [] }]);
    };

    const removeSpec = (index: number) => {
        const newSpecs = [...specs];
        newSpecs.splice(index, 1);
        setSpecs(newSpecs);
    };

    const updateSpecName = (index: number, name: string) => {
        const newSpecs = [...specs];
        newSpecs[index].name = name;
        setSpecs(newSpecs);
    };

    const addSpecValue = (specIndex: number, value: string) => {
        if (!value) return;
        const newSpecs = [...specs];
        if (!newSpecs[specIndex].values.includes(value)) {
            newSpecs[specIndex].values.push(value);
            setSpecs(newSpecs);
        }
    };

    const removeSpecValue = (specIndex: number, valueIndex: number) => {
        const newSpecs = [...specs];
        newSpecs[specIndex].values.splice(valueIndex, 1);
        setSpecs(newSpecs);
    };

    const applyBatchPrice = (price: number) => {
        const currentSkus = form.getValues('skus');
        const newSkus = currentSkus.map((sku) => ({ ...sku, price }));
        replaceSkus(newSkus);
    };

    const applyBatchStock = (stock: number) => {
        const currentSkus = form.getValues('skus');
        const newSkus = currentSkus.map((sku) => ({ ...sku, stock }));
        replaceSkus(newSkus);
    };

    const handleSingleProductToggle = (checked: boolean) => {
        setIsSingleProduct(checked);
        if (checked) {
            setSpecs([]);
            // Ensure one SKU exists for single product
            const currentSkus = form.getValues('skus');
            if (currentSkus.length === 0) {
                replaceSkus([
                    {
                        code: 'default',
                        specs: [],
                        price: 0,
                        stock: 0,
                        marketPrice: 0,
                    },
                ]);
            } else {
                // Keep the first one but clear specs
                const first = currentSkus[0];
                replaceSkus([{ ...first, specs: [], code: 'default' }]);
            }
        }
    };

    const handleImageSelect = (url: string) => {
        // Determine if we are picking cover or appending to images
        if (coverPickerOpen) {
            setValue('cover', url);
        } else if (imagePickerOpen) {
            setValue('images', [...images, url]);
        }
    };

    return (
        <div className='flex flex-col gap-4 pb-10 mx-auto w-full max-w-5xl h-full'>
            <div className='flex gap-4 items-center'>
                <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => navigate({ to: '/mall/product' })}
                >
                    <ArrowLeft className='w-4 h-4' />
                </Button>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>
                        {isEdit ? '编辑商品' : '创建商品'}
                    </h2>
                </div>
                <div className='flex gap-2 ml-auto'>
                    <Button
                        variant='outline'
                        onClick={() => navigate({ to: '/mall/product' })}
                    >
                        取消
                    </Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={mutation.isPending}
                    >
                        <Save className='mr-2 w-4 h-4' /> 保存商品
                    </Button>
                </div>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className='w-full'
            >
                <TabsList className='grid grid-cols-3 w-full'>
                    <TabsTrigger value='basic'>1. 基础信息</TabsTrigger>
                    <TabsTrigger value='skus'>2. 规格与库存</TabsTrigger>
                    <TabsTrigger value='detail'>3. 详情与图片</TabsTrigger>
                </TabsList>

                <TabsContent value='basic' className='mt-4'>
                    <Card>
                        <CardHeader>
                            <CardTitle>基础信息</CardTitle>
                            <CardDescription>
                                设置商品的核心展示信息
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='grid gap-2'>
                                <Label htmlFor='name'>商品名称</Label>
                                <Input
                                    id='name'
                                    {...register('name', { required: true })}
                                    placeholder='例如：纯棉圆领 T 恤'
                                />
                            </div>

                            <div className='grid gap-2'>
                                <Label htmlFor='category'>商品类目</Label>
                                <TreeSelect
                                    options={(categories || []).map((c) => ({
                                        id: c.id,
                                        name: c.name,
                                        parentId: c.parentId,
                                    }))}
                                    value={watch('categoryId')}
                                    onValueChange={(val) =>
                                        setValue('categoryId', Number(val))
                                    }
                                    placeholder='选择商品类目'
                                />
                            </div>

                            <div className='grid gap-2'>
                                <Label htmlFor='desc'>商品描述</Label>
                                <Textarea
                                    id='desc'
                                    {...register('description')}
                                    placeholder='简单描述一下商品...'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='grid gap-2'>
                                    <Label htmlFor='shippingTemplateId'>
                                        运费模板
                                    </Label>
                                    <Select
                                        value={watch(
                                            'shippingTemplateId'
                                        )?.toString()}
                                        onValueChange={(val) =>
                                            setValue(
                                                'shippingTemplateId',
                                                Number(val)
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='选择运费模板' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {shippingTemplates.map((tpl) => (
                                                <SelectItem
                                                    key={tpl.id}
                                                    value={tpl.id.toString()}
                                                >
                                                    {tpl.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='grid gap-2'>
                                    <Label htmlFor='sort'>排序</Label>
                                    <Input
                                        id='sort'
                                        type='number'
                                        {...register('sort', {
                                            valueAsNumber: true,
                                        })}
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='grid gap-2'>
                                    <Label htmlFor='weight'>重量 (kg)</Label>
                                    <Input
                                        id='weight'
                                        type='number'
                                        step='0.001'
                                        {...register('weight', {
                                            valueAsNumber: true,
                                        })}
                                    />
                                </div>
                                <div className='grid gap-2'>
                                    <Label htmlFor='volume'>体积 (m³)</Label>
                                    <Input
                                        id='volume'
                                        type='number'
                                        step='0.001'
                                        {...register('volume', {
                                            valueAsNumber: true,
                                        })}
                                    />
                                </div>
                            </div>

                            <div className='grid gap-2'>
                                <Label>上架状态</Label>
                                <div className='flex items-center mt-2 space-x-2'>
                                    <Switch
                                        checked={watch('status') === 1}
                                        onCheckedChange={(c) =>
                                            setValue('status', c ? 1 : 0)
                                        }
                                    />
                                    <span>
                                        {watch('status') === 1
                                            ? '上架'
                                            : '下架'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='skus' className='mt-4'>
                    <div className='grid gap-6'>
                        <div className='flex justify-between items-center px-2'>
                            <div className='flex gap-3 items-center'>
                                <Label>单品模式</Label>
                                <Switch
                                    checked={isSingleProduct}
                                    onCheckedChange={handleSingleProductToggle}
                                />
                            </div>
                            {!isSingleProduct && (
                                <span className='text-sm text-muted-foreground'>
                                    定义规格并生成商品库存 (SKU)
                                </span>
                            )}
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>规格设置</CardTitle>
                                <CardDescription>
                                    定义商品的规格属性（如：颜色、尺码）
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                {!isSingleProduct && (
                                    <>
                                        {specs.map((spec, idx) => (
                                            <div
                                                key={idx}
                                                className='relative p-4 rounded-lg border bg-muted/20'
                                            >
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='absolute top-2 right-2 text-destructive'
                                                    onClick={() =>
                                                        removeSpec(idx)
                                                    }
                                                >
                                                    <Trash2 className='w-4 h-4' />
                                                </Button>
                                                <div className='grid gap-4'>
                                                    <div className='grid gap-2'>
                                                        <Label>规格名称</Label>
                                                        <Input
                                                            value={spec.name}
                                                            onChange={(e) =>
                                                                updateSpecName(
                                                                    idx,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder='例如：颜色'
                                                            className='max-w-xs'
                                                        />
                                                    </div>
                                                    <div className='grid gap-2'>
                                                        <Label>规格值</Label>
                                                        <div className='flex flex-wrap gap-2 items-center'>
                                                            {spec.values.map(
                                                                (val, vIdx) => (
                                                                    <Badge
                                                                        key={
                                                                            vIdx
                                                                        }
                                                                        variant='secondary'
                                                                        className='pr-1'
                                                                    >
                                                                        {val}
                                                                        <button
                                                                            className='ml-1 hover:text-destructive'
                                                                            onClick={() =>
                                                                                removeSpecValue(
                                                                                    idx,
                                                                                    vIdx
                                                                                )
                                                                            }
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </Badge>
                                                                )
                                                            )}
                                                            <Input
                                                                placeholder='添加规格值 + 回车'
                                                                className='w-32 h-8 text-sm'
                                                                onKeyDown={(
                                                                    e
                                                                ) => {
                                                                    if (
                                                                        e.key ===
                                                                        'Enter'
                                                                    ) {
                                                                        e.preventDefault();
                                                                        addSpecValue(
                                                                            idx,
                                                                            e
                                                                                .currentTarget
                                                                                .value
                                                                        );
                                                                        e.currentTarget.value =
                                                                            '';
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <Button
                                            variant='outline'
                                            onClick={addSpec}
                                            className='w-full border-dashed'
                                        >
                                            <Plus className='mr-2 w-4 h-4' />{' '}
                                            添加规格
                                        </Button>

                                        <div className='flex justify-end'>
                                            <Button onClick={generateSkus}>
                                                生成 SKU 列表
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>SKU 列表</CardTitle>
                                <CardDescription>
                                    设置每个规格组合的价格和库存
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>规格组合</TableHead>
                                            <TableHead>编码</TableHead>
                                            <TableHead>
                                                <div className='flex gap-2 items-center'>
                                                    价格
                                                    <div className='relative group'>
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='p-0 w-6 h-6 opacity-50 group-hover:opacity-100'
                                                        >
                                                            <ChevronDown className='w-3 h-3' />
                                                        </Button>
                                                        <div className='hidden absolute left-0 top-full z-10 p-2 w-32 rounded border shadow-md group-hover:block bg-popover'>
                                                            <Input
                                                                type='number'
                                                                placeholder='批量设置'
                                                                className='h-8 text-xs'
                                                                onKeyDown={(
                                                                    e
                                                                ) => {
                                                                    if (
                                                                        e.key ===
                                                                        'Enter'
                                                                    ) {
                                                                        e.preventDefault();
                                                                        applyBatchPrice(
                                                                            Number(
                                                                                e
                                                                                    .currentTarget
                                                                                    .value
                                                                            )
                                                                        );
                                                                        e.currentTarget.value =
                                                                            '';
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableHead>
                                            <TableHead>
                                                <div className='flex gap-2 items-center'>
                                                    库存
                                                    <div className='relative group'>
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='p-0 w-6 h-6 opacity-50 group-hover:opacity-100'
                                                        >
                                                            <ChevronDown className='w-3 h-3' />
                                                        </Button>
                                                        <div className='hidden absolute left-0 top-full z-10 p-2 w-32 rounded border shadow-md group-hover:block bg-popover'>
                                                            <Input
                                                                type='number'
                                                                placeholder='批量设置'
                                                                className='h-8 text-xs'
                                                                onKeyDown={(
                                                                    e
                                                                ) => {
                                                                    if (
                                                                        e.key ===
                                                                        'Enter'
                                                                    ) {
                                                                        e.preventDefault();
                                                                        applyBatchStock(
                                                                            Number(
                                                                                e
                                                                                    .currentTarget
                                                                                    .value
                                                                            )
                                                                        );
                                                                        e.currentTarget.value =
                                                                            '';
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableHead>
                                            <TableHead className='w-[50px]'></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {skuFields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell>
                                                    {Array.isArray(field.specs)
                                                        ? field.specs
                                                              .map(
                                                                  (s: any) =>
                                                                      `${s.value}`
                                                              )
                                                              .join(' / ')
                                                        : JSON.stringify(
                                                              field.specs
                                                          )}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        {...register(
                                                            `skus.${index}.code`
                                                        )}
                                                        readOnly={
                                                            isSingleProduct
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type='number'
                                                        step='0.01'
                                                        {...register(
                                                            `skus.${index}.price`,
                                                            {
                                                                valueAsNumber: true,
                                                                required:
                                                                    isSingleProduct
                                                                        ? '必填'
                                                                        : undefined,
                                                                min: 0,
                                                            }
                                                        )}
                                                    />
                                                    {errors?.skus?.[index]
                                                        ?.price && (
                                                        <div className='mt-1 text-xs text-destructive'>
                                                            {errors.skus[index]
                                                                ?.price
                                                                ?.message ||
                                                                '价格无效'}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type='number'
                                                        {...register(
                                                            `skus.${index}.stock`,
                                                            {
                                                                valueAsNumber: true,
                                                                required:
                                                                    isSingleProduct
                                                                        ? '必填'
                                                                        : undefined,
                                                                min: 0,
                                                            }
                                                        )}
                                                    />
                                                    {errors?.skus?.[index]
                                                        ?.stock && (
                                                        <div className='mt-1 text-xs text-destructive'>
                                                            {errors.skus[index]
                                                                ?.stock
                                                                ?.message ||
                                                                '库存无效'}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        className='text-destructive'
                                                        onClick={() =>
                                                            replaceSkus(
                                                                skuFields.filter(
                                                                    (_, i) =>
                                                                        i !==
                                                                        index
                                                                )
                                                            )
                                                        }
                                                        disabled={
                                                            isSingleProduct &&
                                                            skuFields.length ===
                                                                1
                                                        }
                                                    >
                                                        <Trash2 className='w-4 h-4' />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value='detail' className='mt-4'>
                    <Card>
                        <CardHeader>
                            <CardTitle>详情与图片</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            {/* Cover Image */}
                            <div className='grid gap-2'>
                                <Label>商品封面</Label>
                                <div className='flex gap-4 items-start'>
                                    <div
                                        className='flex overflow-hidden relative justify-center items-center w-32 h-32 rounded-lg border cursor-pointer bg-muted/20 group'
                                        onClick={() => setCoverPickerOpen(true)}
                                    >
                                        {cover ? (
                                            <>
                                                <img
                                                    src={cover}
                                                    alt='Cover'
                                                    className='object-cover w-full h-full'
                                                />
                                                <div className='flex absolute inset-0 justify-center items-center opacity-0 transition-opacity bg-black/40 group-hover:opacity-100'>
                                                    <span className='text-xs text-white'>
                                                        更换图片
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className='flex flex-col items-center text-muted-foreground'>
                                                <ImageIcon className='mb-1 w-8 h-8' />
                                                <span className='text-xs'>
                                                    选择封面
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {cover && (
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() =>
                                                setValue('cover', '')
                                            }
                                            className='text-destructive'
                                        >
                                            移除
                                        </Button>
                                    )}
                                </div>
                                <Input
                                    {...register('cover')}
                                    className='hidden'
                                />
                            </div>

                            {/* Product Images Gallery */}
                            <div className='grid gap-2'>
                                <Label>商品轮播图</Label>
                                <div className='flex flex-wrap gap-4'>
                                    {images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className='overflow-hidden relative w-24 h-24 rounded-lg border group'
                                        >
                                            <img
                                                src={img}
                                                alt={`Gallery ${idx}`}
                                                className='object-cover w-full h-full'
                                            />
                                            <button
                                                type='button'
                                                className='absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity'
                                                onClick={() => {
                                                    const newImages = [
                                                        ...images,
                                                    ];
                                                    newImages.splice(idx, 1);
                                                    setValue(
                                                        'images',
                                                        newImages
                                                    );
                                                }}
                                            >
                                                <X className='w-3 h-3' />
                                            </button>
                                        </div>
                                    ))}
                                    <div
                                        className='flex justify-center items-center w-24 h-24 rounded-lg border-2 border-dashed cursor-pointer hover:border-primary/50 hover:bg-muted/20'
                                        onClick={() => setImagePickerOpen(true)}
                                    >
                                        <Plus className='w-6 h-6 text-muted-foreground' />
                                    </div>
                                </div>
                            </div>

                            <div className='grid gap-2'>
                                <Label>商品详情 (HTML/Markdown)</Label>
                                <Textarea
                                    {...register('detail')}
                                    placeholder='输入商品详细描述...'
                                    className='min-h-[300px]'
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <ImagePickerDialog
                open={coverPickerOpen || imagePickerOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setCoverPickerOpen(false);
                        setImagePickerOpen(false);
                    }
                }}
                onSelect={handleImageSelect}
            />
        </div>
    );
}
