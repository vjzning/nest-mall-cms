import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dictionaryApi, type DictType } from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PopoverConfirm } from '@/components/ui/popover-confirm';
import { cn } from '@/lib/utils';

interface DictTypeListProps {
    selectedType: DictType | null;
    onSelectType: (type: DictType | null) => void;
}

const typeSchema = z.object({
    name: z.string().min(1, '名称必填'),
    code: z.string().min(1, '编码必填'),
    remark: z.string().optional(),
});

type TypeFormValues = z.infer<typeof typeSchema>;

export function DictTypeList({
    selectedType,
    onSelectType,
}: DictTypeListProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingType, setEditingType] = useState<DictType | null>(null);
    const queryClient = useQueryClient();

    const { data: types, isLoading } = useQuery({
        queryKey: ['dict-types'],
        queryFn: dictionaryApi.findAllTypes,
    });

    const form = useForm<TypeFormValues>({
        resolver: zodResolver(typeSchema),
        defaultValues: {
            name: '',
            code: '',
            remark: '',
        },
    });

    const createMutation = useMutation({
        mutationFn: dictionaryApi.createType,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dict-types'] });
            setIsOpen(false);
            form.reset();
            toast.success('字典类型创建成功');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: TypeFormValues }) =>
            dictionaryApi.updateType(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dict-types'] });
            setIsOpen(false);
            setEditingType(null);
            form.reset();
            toast.success('字典类型更新成功');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: dictionaryApi.removeType,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dict-types'] });
            if (selectedType) {
                onSelectType(null);
            }
            toast.success('字典类型删除成功');
        },
    });

    const handleSubmit = (data: TypeFormValues) => {
        if (editingType) {
            updateMutation.mutate({ id: editingType.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (type: DictType) => {
        setEditingType(type);
        form.reset({
            name: type.name,
            code: type.code,
            remark: type.remark,
        });
        setIsOpen(true);
    };

    return (
        <div className='flex flex-col h-full border-r bg-muted/20'>
            <div className='p-4 border-b flex justify-between items-center bg-background'>
                <h3 className='font-semibold'>字典类型</h3>
                <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => setIsOpen(true)}
                >
                    <Plus className='h-4 w-4' />
                </Button>
            </div>

            <div className='flex-1 overflow-auto p-2 space-y-1'>
                {isLoading ? (
                    <div className='flex items-center justify-center py-8'>
                        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                    </div>
                ) : (
                    types?.map((type) => (
                        <div
                            key={type.id}
                            onClick={() => onSelectType(type)}
                            className={cn(
                                'group flex items-center justify-between p-2 rounded-md cursor-pointer text-sm transition-colors',
                                selectedType?.id === type.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted'
                            )}
                        >
                            <div className='flex flex-col overflow-hidden'>
                                <span className='font-medium truncate'>
                                    {type.name}
                                </span>
                                <span
                                    className={cn(
                                        'text-xs truncate',
                                        selectedType?.id === type.id
                                            ? 'text-primary-foreground/70'
                                            : 'text-muted-foreground'
                                    )}
                                >
                                    {type.code}
                                </span>
                            </div>

                            <div
                                className={cn(
                                    'flex items-center opacity-0 group-hover:opacity-100 transition-opacity',
                                    selectedType?.id === type.id &&
                                        'opacity-100'
                                )}
                            >
                                <Button
                                    size='icon'
                                    variant='ghost'
                                    className='h-7 w-7'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(type);
                                    }}
                                >
                                    <Pencil className='h-3 w-3' />
                                </Button>
                                <PopoverConfirm
                                    title='删除字典类型'
                                    description='确定要删除该字典类型吗？这将同时删除其下所有字典数据。'
                                    onConfirm={() =>
                                        deleteMutation.mutate(type.id)
                                    }
                                >
                                    <Button
                                        size='icon'
                                        variant='ghost'
                                        className='h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10'
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Trash2 className='h-3 w-3' />
                                    </Button>
                                </PopoverConfirm>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Dialog
                open={isOpen}
                onOpenChange={(v) => {
                    setIsOpen(v);
                    if (!v) {
                        setEditingType(null);
                        form.reset();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingType ? '编辑字典类型' : '创建字典类型'}
                        </DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className='space-y-4 py-2'
                    >
                        <div className='space-y-2'>
                            <Label htmlFor='name'>名称</Label>
                            <Input
                                id='name'
                                placeholder='例如：用户状态'
                                {...form.register('name')}
                            />
                            {form.formState.errors.name && (
                                <p className='text-xs text-destructive'>
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='code'>编码</Label>
                            <Input
                                id='code'
                                placeholder='例如：user_status'
                                {...form.register('code')}
                            />
                            {form.formState.errors.code && (
                                <p className='text-xs text-destructive'>
                                    {form.formState.errors.code.message}
                                </p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='remark'>备注</Label>
                            <Input
                                id='remark'
                                placeholder='备注信息'
                                {...form.register('remark')}
                            />
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
