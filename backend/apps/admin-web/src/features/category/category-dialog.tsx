import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { categoryApi, type CreateCategoryDto, type Category } from './api';
import { useEffect } from 'react';
import { toast } from 'sonner';
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";

import { TreeSelect } from '@/components/ui/tree-select';

const categorySchema = z.object({
  parentId: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  sort: z.coerce.number().min(0).default(0),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  parentId?: number; // Pre-select parent when adding sub-category
}

export function CategoryDialog({ open, onOpenChange, category, parentId }: CategoryDialogProps) {
  const queryClient = useQueryClient();

  // Fetch categories for parent selection
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.findAll,
    enabled: open,
  });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      sort: 0,
      parentId: parentId || undefined,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        sort: category.sort,
        parentId: category.parentId,
      });
    } else {
      form.reset({
        name: '',
        slug: '',
        description: '',
        sort: 0,
        parentId: parentId || undefined,
      });
    }
  }, [category, parentId, form]);

  const createMutation = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created');
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateCategoryDto>) => categoryApi.update(category!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated');
      onOpenChange(false);
    },
  });

  const onSubmit = (data: CategoryFormValues) => {
    if (category) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  //   const flattenCategories = (cats: Category[] | undefined, level = 0): {id: number, name: string, level: number}[] => {
  //       if (!cats) return [];
  //       let result: {id: number, name: string, level: number}[] = [];
  //       for (const cat of cats) {
  //           result.push({ id: cat.id, name: cat.name, level });
  //           if (cat.children) {
  //               result = result.concat(flattenCategories(cat.children, level + 1));
  //           }
  //       }
  //       return result;
  //   };

  //   const flatCategories = flattenCategories(categories);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Create Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="parentId">Parent Category</Label>
            <TreeSelect
              options={[{ id: 0, name: 'None (Top Level)' }, ...(categories || [])]}
              value={form.watch('parentId') || 0}
              onValueChange={val =>
                form.setValue('parentId', Number(val) === 0 ? undefined : Number(val))
              }
              placeholder="Select Parent Category"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...form.register('slug')} />
            {form.formState.errors.slug && (
              <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sort">Sort Order</Label>
            <Input id="sort" type="number" {...form.register('sort')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register('description')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {category ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
