import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getShippingTemplate,
    createShippingTemplate,
    updateShippingTemplate,
    getRegionTree,
    type CreateShippingTemplateDto,
} from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus, ArrowLeft, Save, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { RegionSelector } from './region-selector';
import { Badge } from '@/components/ui/badge';

export default function ShippingTemplateForm() {
    const navigate = useNavigate();
    const { id } = useParams({ strict: false }) as { id?: string };
    const isEdit = !!id;
    const queryClient = useQueryClient();

    const [regionSelectorOpen, setRegionSelectorOpen] = useState(false);
    const [currentRuleIndex, setCurrentRuleIndex] = useState<{
        type: 'rule' | 'free';
        index: number;
    } | null>(null);

    const { data: regionTree = [] } = useQuery({
        queryKey: ['region-tree'],
        queryFn: getRegionTree,
    });

    const { data: template } = useQuery({
        queryKey: ['shipping-template', id],
        queryFn: () => getShippingTemplate(Number(id)),
        enabled: isEdit,
    });

    const form = useForm<CreateShippingTemplateDto>({
        defaultValues: {
            name: '',
            chargeType: 1,
            isDefault: false,
            status: 1,
            rules: [],
            freeRules: [],
        },
    });

    const { register, control, handleSubmit, setValue, watch, reset } = form;

    const {
        fields: rules,
        append: appendRule,
        remove: removeRule,
    } = useFieldArray({
        control,
        name: 'rules',
    });

    const {
        fields: freeRules,
        append: appendFreeRule,
        remove: removeFreeRule,
    } = useFieldArray({
        control,
        name: 'freeRules',
    });

    const chargeType = watch('chargeType');

    useEffect(() => {
        if (template) {
            reset(template);
        }
    }, [template, reset]);

    const mutation = useMutation({
        mutationFn: (data: CreateShippingTemplateDto) =>
            isEdit
                ? updateShippingTemplate(Number(id), data)
                : createShippingTemplate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipping-templates'] });
            toast.success(isEdit ? 'Template updated' : 'Template created');
            navigate({ to: '/mall/shipping-template' as any });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Operation failed');
        },
    });

    const openRegionSelector = (type: 'rule' | 'free', index: number) => {
        setCurrentRuleIndex({ type, index });
        setRegionSelectorOpen(true);
    };

    const handleRegionsChange = (codes: string[]) => {
        if (!currentRuleIndex) return;
        const { type, index } = currentRuleIndex;
        if (type === 'rule') {
            setValue(`rules.${index}.regionIds`, codes);
        } else {
            setValue(`freeRules.${index}.regionIds`, codes);
        }
    };

    const getChargeUnit = () => {
        switch (Number(chargeType)) {
            case 1:
                return '件';
            case 2:
                return 'kg';
            case 3:
                return 'm³';
            default:
                return '';
        }
    };

    return (
        <div className='flex flex-col gap-6 pb-10 mx-auto max-w-5xl'>
            <div className='flex gap-4 items-center'>
                <Button
                    variant='ghost'
                    size='icon'
                    onClick={() =>
                        navigate({ to: '/mall/shipping-template' as any })
                    }
                >
                    <ArrowLeft className='w-4 h-4' />
                </Button>
                <h2 className='text-2xl font-bold tracking-tight'>
                    {isEdit ? '编辑模板' : '创建模板'}
                </h2>
            </div>

            <form
                onSubmit={handleSubmit((data) => mutation.mutate(data))}
                className='space-y-6'
            >
                <Card>
                    <CardHeader>
                        <CardTitle>基础信息</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label>模板名称</Label>
                                <Input
                                    {...register('name', { required: true })}
                                    placeholder='例如：全国标准运费'
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label>计费方式</Label>
                                <Select
                                    value={String(chargeType)}
                                    onValueChange={(v) =>
                                        setValue('chargeType', Number(v))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='1'>
                                            按件数
                                        </SelectItem>
                                        <SelectItem value='2'>
                                            按重量
                                        </SelectItem>
                                        <SelectItem value='3'>
                                            按体积
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className='flex items-center space-x-4'>
                            <div className='flex items-center space-x-2'>
                                <Switch
                                    id='isDefault'
                                    checked={watch('isDefault')}
                                    onCheckedChange={(v) =>
                                        setValue('isDefault', v)
                                    }
                                />
                                <Label htmlFor='isDefault'>设为默认模板</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Switch
                                    id='status'
                                    checked={watch('status') === 1}
                                    onCheckedChange={(v) =>
                                        setValue('status', v ? 1 : 0)
                                    }
                                />
                                <Label htmlFor='status'>启用状态</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row justify-between items-center'>
                        <CardTitle>运费规则</CardTitle>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() =>
                                appendRule({
                                    regionIds: [],
                                    firstAmount: 1,
                                    firstFee: 0,
                                    extraAmount: 1,
                                    extraFee: 0,
                                })
                            }
                        >
                            <Plus className='mr-2 w-4 h-4' /> 添加规则
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='w-[300px]'>
                                        配送区域
                                    </TableHead>
                                    <TableHead>首({getChargeUnit()})</TableHead>
                                    <TableHead>首费(元)</TableHead>
                                    <TableHead>续({getChargeUnit()})</TableHead>
                                    <TableHead>续费(元)</TableHead>
                                    <TableHead className='w-[50px]'></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <div className='flex flex-wrap gap-1 items-center'>
                                                {(
                                                    watch(
                                                        `rules.${index}.regionIds`
                                                    ) || []
                                                ).length > 0 ? (
                                                    <div className='flex overflow-y-auto flex-wrap gap-1 max-h-20'>
                                                        <Badge variant='secondary'>
                                                            已选{' '}
                                                            {
                                                                watch(
                                                                    `rules.${index}.regionIds`
                                                                )?.length
                                                            }{' '}
                                                            个地区
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    <span className='text-sm italic text-muted-foreground'>
                                                        全国通用 (默认)
                                                    </span>
                                                )}
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={() =>
                                                        openRegionSelector(
                                                            'rule',
                                                            index
                                                        )
                                                    }
                                                >
                                                    <MapPin className='w-4 h-4' />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type='number'
                                                {...register(
                                                    `rules.${index}.firstAmount`,
                                                    { valueAsNumber: true }
                                                )}
                                                className='w-20'
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type='number'
                                                step='0.01'
                                                {...register(
                                                    `rules.${index}.firstFee`,
                                                    { valueAsNumber: true }
                                                )}
                                                className='w-20'
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type='number'
                                                {...register(
                                                    `rules.${index}.extraAmount`,
                                                    { valueAsNumber: true }
                                                )}
                                                className='w-20'
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type='number'
                                                step='0.01'
                                                {...register(
                                                    `rules.${index}.extraFee`,
                                                    { valueAsNumber: true }
                                                )}
                                                className='w-20'
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='icon'
                                                className='text-destructive'
                                                onClick={() =>
                                                    removeRule(index)
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

                <Card>
                    <CardHeader className='flex flex-row justify-between items-center'>
                        <CardTitle>包邮规则 (可选)</CardTitle>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() =>
                                appendFreeRule({
                                    regionIds: [],
                                    condType: 1,
                                    fullAmount: 0,
                                    fullQuantity: 0,
                                })
                            }
                        >
                            <Plus className='mr-2 w-4 h-4' /> 添加包邮规则
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='w-[300px]'>
                                        配送区域
                                    </TableHead>
                                    <TableHead>包邮条件</TableHead>
                                    <TableHead>条件设置</TableHead>
                                    <TableHead className='w-[50px]'></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {freeRules.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <div className='flex flex-wrap gap-1 items-center'>
                                                {(
                                                    watch(
                                                        `freeRules.${index}.regionIds`
                                                    ) || []
                                                ).length > 0 ? (
                                                    <Badge variant='secondary'>
                                                        已选{' '}
                                                        {
                                                            watch(
                                                                `freeRules.${index}.regionIds`
                                                            )?.length
                                                        }{' '}
                                                        个地区
                                                    </Badge>
                                                ) : (
                                                    <span className='text-sm italic text-muted-foreground'>
                                                        选择地区
                                                    </span>
                                                )}
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={() =>
                                                        openRegionSelector(
                                                            'free',
                                                            index
                                                        )
                                                    }
                                                >
                                                    <MapPin className='w-4 h-4' />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={String(
                                                    watch(
                                                        `freeRules.${index}.condType`
                                                    )
                                                )}
                                                onValueChange={(v) =>
                                                    setValue(
                                                        `freeRules.${index}.condType`,
                                                        Number(v)
                                                    )
                                                }
                                            >
                                                <SelectTrigger className='w-40'>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='1'>
                                                        按件数满额包邮
                                                    </SelectItem>
                                                    <SelectItem value='2'>
                                                        按金额满额包邮
                                                    </SelectItem>
                                                    <SelectItem value='3'>
                                                        件数+金额同时满足
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex gap-2 items-center'>
                                                {(watch(
                                                    `freeRules.${index}.condType`
                                                ) === 1 ||
                                                    watch(
                                                        `freeRules.${index}.condType`
                                                    ) === 3) && (
                                                    <div className='flex gap-1 items-center'>
                                                        <Label className='text-xs'>
                                                            满件数 ≥
                                                        </Label>
                                                        <Input
                                                            type='number'
                                                            {...register(
                                                                `freeRules.${index}.fullQuantity`,
                                                                {
                                                                    valueAsNumber: true,
                                                                }
                                                            )}
                                                            className='w-16'
                                                        />
                                                    </div>
                                                )}
                                                {(watch(
                                                    `freeRules.${index}.condType`
                                                ) === 2 ||
                                                    watch(
                                                        `freeRules.${index}.condType`
                                                    ) === 3) && (
                                                    <div className='flex gap-1 items-center'>
                                                        <Label className='text-xs'>
                                                            满金额 ≥ ¥
                                                        </Label>
                                                        <Input
                                                            type='number'
                                                            step='0.01'
                                                            {...register(
                                                                `freeRules.${index}.fullAmount`,
                                                                {
                                                                    valueAsNumber: true,
                                                                }
                                                            )}
                                                            className='w-20'
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='icon'
                                                className='text-destructive'
                                                onClick={() =>
                                                    removeFreeRule(index)
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

                <div className='flex gap-4 justify-end'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() =>
                            navigate({ to: '/mall/shipping-template' as any })
                        }
                    >
                        取消
                    </Button>
                    <Button type='submit' disabled={mutation.isPending}>
                        {mutation.isPending && (
                            <Loader2 className='mr-2 w-4 h-4 animate-spin' />
                        )}
                        <Save className='mr-2 w-4 h-4' />
                        保存模板
                    </Button>
                </div>
            </form>

            <RegionSelector
                open={regionSelectorOpen}
                onOpenChange={setRegionSelectorOpen}
                options={regionTree}
                value={
                    currentRuleIndex
                        ? currentRuleIndex.type === 'rule'
                            ? watch(
                                  `rules.${currentRuleIndex.index}.regionIds`
                              ) || []
                            : watch(
                                  `freeRules.${currentRuleIndex.index}.regionIds`
                              ) || []
                        : []
                }
                onChange={handleRegionsChange}
            />
        </div>
    );
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        >
            <path d='M21 12a9 9 0 1 1-6.219-8.56' />
        </svg>
    );
}
