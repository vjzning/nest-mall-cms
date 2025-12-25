import { useForm, type FieldErrors } from 'react-hook-form';
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
import { roleApi, type CreateRoleDto, type Role } from './api';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menuApi } from '../menu/api';
import { Label } from '@/components/ui/label';
import { MenuTree } from './menu-tree';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  menuIds: z.array(z.coerce.number()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  onSubmit: (data: CreateRoleDto & { menuIds?: number[] }) => Promise<void>;
}

export function RoleDialog({ open, onOpenChange, role, onSubmit }: RoleDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      code: '',
      description: '',
      menuIds: [],
    },
  });

  const { data: menus } = useQuery({
    queryKey: ['menus'],
    queryFn: menuApi.findAll,
    enabled: open,
  });

  // Fetch full role details including permissions when role is provided
  const { data: roleDetails, isLoading: isLoadingRole } = useQuery({
    queryKey: ['role', role?.id],
    queryFn: () => roleApi.findOne(role!.id),
    enabled: !!role && open,
  });

  useEffect(() => {
    if (role) {
      // Use roleDetails if available, otherwise fallback to role (which might lack menus)
      // But roleDetails comes async, so this effect runs when roleDetails changes too
      const currentRole = roleDetails || role;
      
      form.reset({
        name: currentRole.name,
        code: currentRole.code,
        description: currentRole.description || '',
        menuIds: currentRole.menus?.map(m => Number(m.id)) || [],
      });
    } else {
      form.reset({
        name: '',
        code: '',
        description: '',
        menuIds: [],
      });
    }
  }, [role, roleDetails, form, open]);

  const handleSubmit = async (values: FormValues) => {
    console.log('Form submitted:', values);
    try {
        await onSubmit(values);
        onOpenChange(false);
    } catch (e) {
        console.error('Submit error:', e);
    }
  };

  const onErrors = (errors: FieldErrors<FormValues>) => {
      console.log('Form errors:', errors);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Role' : 'Create Role'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, onErrors)} className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto pr-2">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Admin" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                    <FormItem className="mt-4">
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                        <Input placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem className="mt-4">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Input placeholder="Description" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="mt-6">
                    <Label>Permissions (Menus)</Label>
                    {isLoadingRole ? (
                        <div className="text-sm text-muted-foreground mt-2">Loading permissions...</div>
                    ) : (
                        <div className="h-[300px] w-full rounded-md border p-4 mt-2 overflow-y-auto">
                            <FormField
                                control={form.control}
                                name="menuIds"
                                render={({ field }) => (
                                    <FormItem>
                                        <MenuTree
                                            menus={menus || []}
                                            value={field.value || []}
                                            onChange={field.onChange}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4 mt-auto border-t">
              <Button type="submit" className="w-full">
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
