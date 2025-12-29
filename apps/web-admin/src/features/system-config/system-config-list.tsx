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
    key: z.string().min(1, 'Key is required'),
    value: z.string().min(1, 'Value is required'),
    group: z.string().min(1, 'Group is required'),
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
            toast.success('Config created');
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || 'Failed to create config'
            );
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
            toast.success('Config updated');
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || 'Failed to update config'
            );
        },
    });

    const deleteMutation = useMutation({
        mutationFn: systemConfigApi.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-configs'] });
            toast.success('Config deleted');
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || 'Failed to delete config'
            );
        },
    });

    const refreshCacheMutation = useMutation({
        mutationFn: systemConfigApi.refreshCache,
        onSuccess: () => {
            toast.success('System cache refreshed');
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || 'Failed to refresh cache'
            );
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
                        System Configuration
                    </h2>
                    <p className='text-muted-foreground'>
                        Manage global system settings and sensitive keys
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
                        Refresh Cache
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
                        <Plus className='mr-2 w-4 h-4' /> Add Config
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
                        All
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
                            <TableHead className='w-[200px]'>Key</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead className='w-[100px]'>Group</TableHead>
                            <TableHead className='w-[100px]'>
                                Encrypted
                            </TableHead>
                            <TableHead className='w-[200px]'>
                                Description
                            </TableHead>
                            <TableHead className='w-[100px] text-right'>
                                Actions
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
                                            <Lock className='mr-1 w-3 h-3' />{' '}
                                            Yes
                                        </div>
                                    ) : (
                                        <div className='flex items-center text-xs text-muted-foreground'>
                                            <Unlock className='mr-1 w-3 h-3' />{' '}
                                            No
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
                                            title='Delete Config?'
                                            description='This action cannot be undone.'
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
                                    No configs found.
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
                            {editingConfig ? 'Edit Config' : 'Add Config'}
                        </DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className='space-y-4'
                    >
                        <div className='grid gap-4 py-4'>
                            <div className='grid grid-cols-4 gap-4 items-center'>
                                <Label htmlFor='key' className='text-right'>
                                    Key
                                </Label>
                                <div className='col-span-3'>
                                    <Input
                                        id='key'
                                        {...form.register('key')}
                                        placeholder='e.g. oss.accessKey'
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
                                    Group
                                </Label>
                                <div className='col-span-3'>
                                    <div className='flex gap-2'>
                                        <div className='flex-1'>
                                            {isCustomGroup ? (
                                                <Input
                                                    id='group'
                                                    {...form.register('group')}
                                                    placeholder='e.g. oss'
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
                                                                <SelectValue placeholder='Select group' />
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
                                                    ? 'Select from existing'
                                                    : 'Enter custom group'
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
                                    Encrypt
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
                                        Encrypt value in database
                                    </Label>
                                </div>
                            </div>
                            <div className='grid grid-cols-4 gap-4 items-start'>
                                <Label
                                    htmlFor='value'
                                    className='pt-2 text-right'
                                >
                                    Value
                                </Label>
                                <div className='col-span-3'>
                                    <Textarea
                                        id='value'
                                        {...form.register('value')}
                                        placeholder='Configuration value'
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
                                    Description
                                </Label>
                                <div className='col-span-3'>
                                    <Input
                                        id='description'
                                        {...form.register('description')}
                                        placeholder='Optional description'
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type='submit'
                                disabled={
                                    createMutation.isPending ||
                                    updateMutation.isPending
                                }
                            >
                                {editingConfig ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
