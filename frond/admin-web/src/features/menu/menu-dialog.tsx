import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TreeSelect } from '@/components/ui/tree-data-table';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menuApi, type CreateMenuDto, type Menu } from './api';

const formSchema = z.object({
  parentId: z.coerce.number().optional(),
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  type: z.coerce.number(),
  path: z.string().optional(),
  component: z.string().optional(),
  icon: z.string().optional(),
  sort: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu?: Menu | null;
  onSubmit: (data: CreateMenuDto) => Promise<void>;
}

export function MenuDialog({ open, onOpenChange, menu, onSubmit }: MenuDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      parentId: 0,
      name: '',
      code: '',
      type: 1,
      path: '',
      component: '',
      icon: '',
      sort: 0,
    },
  });

  const { data: menus } = useQuery({
    queryKey: ['menus'],
    queryFn: menuApi.findAll,
    enabled: open, 
  });

  useEffect(() => {
    if (menu) {
      form.reset({
        parentId: Number(menu.parentId) || 0,
        name: menu.name,
        code: menu.code,
        type: menu.type,
        path: menu.path || '',
        component: menu.component || '',
        icon: menu.icon || '',
        sort: menu.sort || 0,
      });
    } else {
      form.reset({
        parentId: 0,
        name: '',
        code: '',
        type: 1,
        path: '',
        component: '',
        icon: '',
        sort: 0,
      });
    }
  }, [menu, form, open]);

  const handleSubmit = async (values: FormValues) => {
    await onSubmit({
      ...values,
      parentId: values.parentId || 0,
      path: values.path || '',
      component: values.component || '',
      icon: values.icon || '',
      sort: values.sort || 0,
    });
    onOpenChange(false);
  };

  // Filter out current menu and its children to prevent cycles (simplified: just filter current)
  // Also only show Directories (type 1) or Menus (type 2) as parents? usually only Directories and Menus can have children.
  const parentOptions = menus?.filter(m => m.type !== 3 && String(m.id) !== String(menu?.id)) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{menu ? 'Edit Menu' : 'Create Menu'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Directory</SelectItem>
                        <SelectItem value="2">Menu</SelectItem>
                        <SelectItem value="3">Button</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Menu</FormLabel>
                    <FormControl>
                        <TreeSelect
                            options={[{ id: 0, name: 'Root' }, ...(parentOptions || [])]}
                            value={field.value}
                            onValueChange={(val) => field.onChange(Number(val))}
                            placeholder="Select parent"
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Menu Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="permission:code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Path</FormLabel>
                    <FormControl>
                      <Input placeholder="/route-path" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="component"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Component</FormLabel>
                    <FormControl>
                      <Input placeholder="Layout or path/to/component" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input placeholder="Icon Name" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="sort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || 0} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              Save
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
