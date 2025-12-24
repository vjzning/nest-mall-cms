import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi, type Category } from './api';
import { CategoryDialog } from './category-dialog';
import { Button } from '@/components/ui/button';
import { PopoverConfirm } from '@/components/ui/popover-confirm';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { TreeDataTable } from '@/components/ui/tree-data-table';

export default function CategoryList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.findAll,
  });

  const deleteMutation = useMutation({
    mutationFn: categoryApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    },
  });

  const columns = [
      {
          header: 'Name',
          accessorKey: 'name' as keyof Category,
      },
      {
          header: 'Slug',
          accessorKey: 'slug' as keyof Category,
      },
      {
          header: 'Sort',
          accessorKey: 'sort' as keyof Category,
      },
      {
          header: 'Description',
          accessorKey: 'description' as keyof Category,
          className: 'text-muted-foreground max-w-[200px] truncate'
      }
  ];

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Category Management</h2>
          <p className="text-muted-foreground">Manage article categories hierarchy</p>
        </div>
        <Button onClick={() => {
          setEditingCategory(null);
          setParentId(undefined);
          setDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <TreeDataTable
        data={categories || []}
        columns={columns}
        actionColumn={(cat) => (
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setEditingCategory(null);
                  setParentId(cat.id);
                  setDialogOpen(true);
                }}
                title="Add Subcategory"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setEditingCategory(cat);
                  setDialogOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <PopoverConfirm
                title="Delete Category?"
                description="This will also delete all subcategories."
                onConfirm={() => deleteMutation.mutateAsync(cat.id)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </PopoverConfirm>
            </div>
        )}
      />

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        parentId={parentId}
      />
    </div>
  );
}
