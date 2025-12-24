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
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  remark: z.string().optional(),
});

type TypeFormValues = z.infer<typeof typeSchema>;

export function DictTypeList({ selectedType, onSelectType }: DictTypeListProps) {
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
      toast.success('Type created');
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
      toast.success('Type updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: dictionaryApi.removeType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dict-types'] });
      if (selectedType) {
        onSelectType(null);
      }
      toast.success('Type deleted');
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

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r">
      <div className="flex justify-between items-center p-4 border-b bg-muted/20">
        <h3 className="font-semibold">Dictionary Types</h3>
        <Button
          size="sm"
          onClick={() => {
            setEditingType(null);
            form.reset({ name: '', code: '', remark: '' });
            setIsOpen(true);
          }}
        >
          <Plus className="mr-1 w-4 h-4" /> Add
        </Button>
      </div>

      <div className="overflow-auto flex-1">
        {types?.map(type => (
          <div
            key={type.id}
            className={cn(
              'p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors flex justify-between items-center group',
              selectedType?.id === type.id && 'bg-muted border-l-4 border-l-primary',
            )}
            onClick={() => onSelectType(type)}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{type.name}</div>
              <div className="text-xs truncate text-muted-foreground">{type.code}</div>
            </div>
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7"
                onClick={e => {
                  e.stopPropagation();
                  handleEdit(type);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <PopoverConfirm
                onConfirm={() => deleteMutation.mutateAsync(type.id)}
                title="Delete Type?"
                description="This will permanently delete the dictionary type and all its data."
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-destructive"
                  onClick={e => e.stopPropagation()}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </PopoverConfirm>
            </div>
          </div>
        ))}
        {types?.length === 0 && (
          <div className="p-8 text-sm text-center text-muted-foreground">
            No types found. Create one to get started.
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? 'Edit Type' : 'Create Type'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...form.register('name')} placeholder="e.g. Payment Method" />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input {...form.register('code')} placeholder="e.g. payment_method" />
              {form.formState.errors.code && (
                <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Remark</Label>
              <Input {...form.register('remark')} placeholder="Optional description" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingType ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
