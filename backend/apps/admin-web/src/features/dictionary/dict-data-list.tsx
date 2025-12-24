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
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
  sort: z.coerce.number().optional().default(0),
  isDefault: z.boolean().optional().default(false),
  status: z.coerce.number().optional().default(1),
  remark: z.string().optional(),
  meta: z
    .string()
    .optional()
    .refine(val => {
      if (!val) return true;
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, 'Must be valid JSON string'),
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
      queryClient.invalidateQueries({ queryKey: ['dict-data', type.code] });
      setIsOpen(false);
      form.reset();
      toast.success('Data item created');
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
      queryClient.invalidateQueries({ queryKey: ['dict-data', type.code] });
      setIsOpen(false);
      setEditingData(null);
      form.reset();
      toast.success('Data item updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: dictionaryApi.removeData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dict-data', type.code] });
      toast.success('Data item deleted');
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
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b bg-muted/20">
        <div>
          <h3 className="flex gap-2 items-center font-semibold">
            {type.name}
            <Badge variant="outline" className="font-mono text-xs">
              {type.code}
            </Badge>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {type.remark || 'Manage dictionary values'}
          </p>
        </div>
        <Button
          size="sm"
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
          <Plus className="mr-1 w-4 h-4" /> Add Value
        </Button>
      </div>

      <div className="overflow-auto flex-1 p-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Sort</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-[100px]">Default</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list?.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.sort}</TableCell>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell className="font-mono text-xs">{item.value}</TableCell>
                  <TableCell>
                    {item.isDefault && <Badge variant="secondary">Default</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === 1 ? 'default' : 'destructive'}>
                      {item.status === 1 ? 'Active' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <PopoverConfirm
                        onConfirm={() => deleteMutation.mutateAsync(item.id)}
                        title="Delete Value?"
                        description="This action cannot be undone."
                      >
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </PopoverConfirm>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {list?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No values found. Add one to get started.
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
            <DialogTitle>{editingData ? 'Edit Value' : 'Add Value'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Label</Label>
                <Input {...form.register('label')} placeholder="Display Name" />
                {form.formState.errors.label && (
                  <p className="text-sm text-destructive">{form.formState.errors.label.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input {...form.register('value')} placeholder="Stored Value" />
                {form.formState.errors.value && (
                  <p className="text-sm text-destructive">{form.formState.errors.value.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" {...form.register('sort')} />
              </div>
              <div className="space-y-2">
                <Label>Remark</Label>
                <Input {...form.register('remark')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Meta (JSON)</Label>
              <Textarea
                {...form.register('meta')}
                placeholder='{"key": "value"}'
                className="font-mono text-xs"
                rows={3}
              />
              {form.formState.errors.meta && (
                <p className="text-sm text-destructive">{form.formState.errors.meta.message}</p>
              )}
            </div>

            <div className="flex gap-8 items-center py-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={form.watch('isDefault')}
                  onCheckedChange={checked => form.setValue('isDefault', checked)}
                />
                <Label>Is Default</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={form.watch('status') === 1}
                  onCheckedChange={checked => form.setValue('status', checked ? 1 : 0)}
                />
                <Label>Enabled</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingData ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
