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
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { roleApi } from '../role/api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import type { CreateUserDto, User } from './api';

const formSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  nickname: z.string().optional(),
  password: z.string().optional(),
  email: z.email().or(z.literal('')),
  phone: z.string().optional(),
  status: z.coerce.number().optional(),
  roleIds: z.array(z.number()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSubmit: (data: CreateUserDto) => Promise<void>;
}

export function UserDialog({ open, onOpenChange, user, onSubmit }: UserDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      username: '',
      nickname: '',
      password: '',
      email: '',
      phone: '',
      status: 1,
      roleIds: [],
    },
  });

  const { data: roles } = useQuery({
      queryKey: ['roles'],
      queryFn: roleApi.findAll,
  });


  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        nickname: user.nickname || '',
        password: '', // Don't show password
        email: user.email || '',
        phone: user.phone || '',
        status: user.status,
        roleIds: user.roles?.map(r => Number(r.id)) || [], // Ensure loaded role IDs are numbers
      });
    } else {
      form.reset({
        username: '',
        nickname: '',
        password: '',
        email: '',
        phone: '',
        status: 1,
        roleIds: [],
      });
    }
  }, [user, form, open]);

  const handleSubmit = async (values: FormValues) => {
    // If editing, remove password if empty
    const submitData: CreateUserDto = {
        username: values.username,
        nickname: values.nickname,
        email: values.email,
        phone: values.phone,
        status: Number(values.status),
        roleIds: values.roleIds?.map(Number), // Ensure IDs are numbers
    };
    if (values.password) {
        submitData.password = values.password;
    }
    await onSubmit(submitData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Create User'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!user && (
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="password" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}
            
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname</FormLabel>
                  <FormControl>
                    <Input placeholder="nickname" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={String(field.value)}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="1">Active</SelectItem>
                        <SelectItem value="0">Disabled</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />

             {/* Role Selection (Simplified for now) */}
             {roles && (
                 <FormField
                 control={form.control}
                 name="roleIds"
                 render={() => (
                    <FormItem>
                        <FormLabel>Roles</FormLabel>
                        <div className="flex flex-wrap gap-2">
                            {roles.map(role => (
                                <FormField
                                    key={role.id}
                                    control={form.control}
                                    name="roleIds"
                                    render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={role.id}
                                                className="flex flex-row items-center space-x-2 space-y-0"
                                            >
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-300"
                                                        checked={field.value?.includes(Number(role.id))}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            const currentValue = field.value || [];
                                                            if (checked) {
                                                                // Convert to number explicitly when adding
                                                                field.onChange([...currentValue, Number(role.id)]);
                                                            } else {
                                                                field.onChange(currentValue.filter((id) => id !== Number(role.id)));
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="m-0 font-normal cursor-pointer">
                                                        {role.name}
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )
                                    }}
                                />
                            ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                 )}
                />
             )}

            <Button type="submit" className="w-full">
              Save
            </Button>
            {Object.keys(form.formState.errors).length > 0 && (
                <div className="text-sm text-red-500">
                    Please fix the errors above.
                </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
