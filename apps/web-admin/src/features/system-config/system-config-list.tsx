import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    systemConfigApi,
    type SystemConfig,
    type CreateConfigDto,
} from './api';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    RefreshCw,
    Lock,
    Unlock,
    ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { PopoverConfirm } from '@/components/ui/popover-confirm';
import { Textarea } from '@/components/ui/textarea';

const configSchema = z.object({
    key: z.string().min(1, '配置键必填'),
    value: z.string().min(1, '配置值必填'),
    group: z.string().min(1, '分组必填'),
    isEncrypted: z.boolean(),
    description: z.string().optional(),
});

type ConfigFormValues = z.infer<typeof configSchema>;

export default function SystemConfigList() {
    const [isOpen, setIsOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(
        null
    );
    const [activeGroup, setActiveGroup] = useState<string>('all');
    const [isCustomGroup, setIsCustomGroup] = useState(false);
    const queryClient = useQueryClient();

    const { data: configs, isLoading } = useQuery({
        queryKey: ['system-configs'],
        queryFn: systemConfigApi.findAll,
    });

    // Extract unique groups
    const groups = useMemo(() => {
        if (!configs) return [];
        const groupSet = new Set(configs.map((c) => c.group));
        return Array.from(groupSet).sort();
    }, [configs]);

    // Filter configs by active group
    const filteredConfigs = useMemo(() => {
        if (!configs) return [];
        if (activeGroup === 'all') return configs;
        return configs.filter((c) => c.group === activeGroup);
    }, [configs, activeGroup]);

    const form = useForm<ConfigFormValues>({
        resolver: zodResolver(configSchema),
        defaultValues: {
            key: '',
            value: '',
            group: 'system',
            isEncrypted: false,
            description: '',
        },
    });

    const createMutation = useMutation({
        mutationFn: systemConfigApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-configs'] });
            setIsOpen(false);
            form.reset();
            toast.success('配置已创建');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || '创建配置失败');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: Partial<CreateConfigDto>;
        }) => systemConfigApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-configs'] });
            setIsOpen(false);
            setEditingConfig(null);
            form.reset();
            toast.success('配置已更新');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || '更新配置失败');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: systemConfigApi.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-configs'] });
            toast.success('配置已删除');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || '删除配置失败');
        },
    });

    const refreshCacheMutation = useMutation({
        mutationFn: systemConfigApi.refreshCache,
        onSuccess: () => {
            toast.success('系统缓存已刷新');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || '刷新缓存失败');
        },
    });

    const handleSubmit = (data: ConfigFormValues) => {
        if (editingConfig) {
            updateMutation.mutate({ id: editingConfig.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (config: SystemConfig) => {
        setEditingConfig(config);
        form.reset({
            key: config.key,
            value: config.value, // Will be masked '******' if encrypted
            group: config.group,
            isEncrypted: config.isEncrypted,
            description: config.description || '',
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
        <div className='flex flex-col gap-6 h-full'>
            <div className='flex justify-between items-center'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>
                        系统配置
                    </h2>
                    <p className='text-muted-foreground'>
                        管理全局系统设置和敏感密钥
                    </p>
                </div>
                <div className='flex gap-2'>
                    <Button
                        variant='outline'
                        onClick={() => refreshCacheMutation.mutate()}
                        disabled={refreshCacheMutation.isPending}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${refreshCacheMutation.isPending ? 'animate-spin' : ''}`}
                        />
                        刷新缓存
                    </Button>
                    <Button
                        onClick={() => {
                            setEditingConfig(null);
                            form.reset({
                                key: '',
                                value: '',
                                group: 'system',
                                isEncrypted: false,
                                description: '',
                            });
                            setIsOpen(true);
                        }}
                    >
                        <Plus className='mr-2 w-4 h-4' /> 添加配置
                    </Button>
                </div>
            </div>

            <Tabs
                value={activeGroup}
                onValueChange={setActiveGroup}
                className='w-full'
            >
                <TabsList className='flex-wrap gap-2 justify-start p-0 mb-4 h-auto bg-transparent'>
                    <TabsTrigger
                        value='all'
                        className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background'
                    >
                        全部
                    </TabsTrigger>
                    {groups.map((group) => (
                        <TabsTrigger
                            key={group}
                            value={group}
                            className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background capitalize'
                        >
                            {group}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className='rounded-md border bg-card'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-[200px]'>配置键</TableHead>
                            <TableHead>配置值</TableHead>
                            <TableHead className='w-[100px]'>分组</TableHead>
                            <TableHead className='w-[100px]'>已加密</TableHead>
                            <TableHead className='w-[200px]'>描述</TableHead>
                            <TableHead className='w-[100px] text-right'>
                                操作
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredConfigs?.map((config) => (
                            <TableRow key={config.id}>
                                <TableCell className='font-mono text-xs font-medium'>
                                    {config.key}
                                </TableCell>
                                <TableCell
                                    className='font-mono text-xs max-w-[300px] truncate'
                                    title={config.value}
                                >
                                    {config.value}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant='outline'
                                        className='capitalize'
                                    >
                                        {config.group}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {config.isEncrypted ? (
                                        <div className='flex items-center text-xs text-amber-500'>
                                            <Lock className='mr-1 w-3 h-3' /> 是
                                        </div>
                                    ) : (
                                        <div className='flex items-center text-xs text-muted-foreground'>
                                            <Unlock className='mr-1 w-3 h-3' />{' '}
                                            否
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className='text-muted-foreground text-sm truncate max-w-[200px]'>
                                    {config.description}
                                </TableCell>
                                <TableCell className='text-right'>
                                    <div className='flex gap-2 justify-end'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='w-8 h-8'
                                            onClick={() => handleEdit(config)}
                                        >
                                            <Pencil className='w-4 h-4' />
                                        </Button>
                                        <PopoverConfirm
                                            title='删除配置？'
                                            description='此操作无法撤销。'
                                            onConfirm={() =>
                                                deleteMutation.mutateAsync(
                                                    config.id
                                                )
                                            }
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
                        {filteredConfigs?.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className='h-24 text-center text-muted-foreground'
                                >
                                    未找到配置。
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className='sm:max-w-[500px]'>
                    <DialogHeader>
                        <DialogTitle>
                            {editingConfig ? '编辑配置' : '添加配置'}
                        </DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className='space-y-4'
                    >
                        <div className='grid gap-4 py-4'>
                            <div className='grid grid-cols-4 gap-4 items-center'>
                                <Label htmlFor='key' className='text-right'>
                                    配置键
                                </Label>
                                <div className='col-span-3'>
                                    <Input
                                        id='key'
                                        {...form.register('key')}
                                        placeholder='例如：oss.accessKey'
                                        disabled={!!editingConfig}
                                    />
                                    {form.formState.errors.key && (
                                        <p className='mt-1 text-xs text-destructive'>
                                            {form.formState.errors.key.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className='grid grid-cols-4 gap-4 items-center'>
                                <Label htmlFor='group' className='text-right'>
                                    分组
                                </Label>
                                <div className='col-span-3'>
                                    <div className='flex gap-2'>
                                        <div className='flex-1'>
                                            {isCustomGroup ? (
                                                <Input
                                                    id='group'
                                                    {...form.register('group')}
                                                    placeholder='例如：oss'
                                                />
                                            ) : (
                                                <Controller
                                                    name='group'
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <Select
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            value={field.value}
                                                        >
                                                            <SelectTrigger id='group'>
                                                                <SelectValue placeholder='选择分组' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {groups.map(
                                                                    (g) => (
                                                                        <SelectItem
                                                                            key={
                                                                                g
                                                                            }
                                                                            value={
                                                                                g
                                                                            }
                                                                        >
                                                                            {g}
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            )}
                                        </div>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            size='icon'
                                            onClick={() =>
                                                setIsCustomGroup(!isCustomGroup)
                                            }
                                            title={
                                                isCustomGroup
                                                    ? '从现有分组中选择'
                                                    : '输入自定义分组'
                                            }
                                        >
                                            {isCustomGroup ? (
                                                <ChevronDown className='w-4 h-4' />
                                            ) : (
                                                <Plus className='w-4 h-4' />
                                            )}
                                        </Button>
                                    </div>
                                    {form.formState.errors.group && (
                                        <p className='mt-1 text-xs text-destructive'>
                                            {
                                                form.formState.errors.group
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className='grid grid-cols-4 gap-4 items-center'>
                                <Label
                                    htmlFor='isEncrypted'
                                    className='text-right'
                                >
                                    加密
                                </Label>
                                <div className='flex col-span-3 gap-2 items-center'>
                                    <Switch
                                        id='isEncrypted'
                                        checked={form.watch('isEncrypted')}
                                        onCheckedChange={(checked) =>
                                            form.setValue(
                                                'isEncrypted',
                                                checked
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor='isEncrypted'
                                        className='font-normal text-muted-foreground'
                                    >
                                        在数据库中加密存储
                                    </Label>
                                </div>
                            </div>
                            <div className='grid grid-cols-4 gap-4 items-start'>
                                <Label
                                    htmlFor='value'
                                    className='pt-2 text-right'
                                >
                                    配置值
                                </Label>
                                <div className='col-span-3'>
                                    <Textarea
                                        id='value'
                                        {...form.register('value')}
                                        placeholder='输入配置值'
                                        rows={4}
                                    />
                                    {form.formState.errors.value && (
                                        <p className='mt-1 text-xs text-destructive'>
                                            {
                                                form.formState.errors.value
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className='grid grid-cols-4 gap-4 items-center'>
                                <Label
                                    htmlFor='description'
                                    className='text-right'
                                >
                                    描述
                                </Label>
                                <div className='col-span-3'>
                                    <Input
                                        id='description'
                                        {...form.register('description')}
                                        placeholder='选填描述'
                                    />
                                </div>
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
