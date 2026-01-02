import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Loader2, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
    username: z.string().min(1, '请输入用户名'),
    password: z.string().min(1, '请输入密码'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', data);
            const { access_token, user } = response.data;

            setAuth(access_token, user || { username: data.username });
            toast.success('登录成功');
            navigate({ to: '/' });
        } catch (err: any) {
            const message = err.response?.data?.message || '登录失败';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='container grid relative flex-col justify-center items-center min-h-screen lg:max-w-none lg:grid-cols-2 lg:px-0'>
            <div className='hidden relative flex-col p-10 h-full text-white bg-muted dark:border-r lg:flex'>
                <div className='absolute inset-0 bg-zinc-900' />
                <div className='flex relative z-20 items-center text-lg font-medium'>
                    <LayoutDashboard className='mr-2 w-6 h-6' />
                    后台管理系统
                </div>
                <div className='relative z-20 mt-auto'>
                    <blockquote className='space-y-2'>
                        <p className='text-lg'>
                            &ldquo;这个系统节省了我无数的工作时间，并帮助我比以往任何时候都更快地向客户交付出色的设计。&rdquo;
                        </p>
                        <footer className='text-sm'>索菲亚 · 戴维斯</footer>
                    </blockquote>
                </div>
            </div>
            <div className='lg:p-8'>
                <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
                    <Card className='border-0 shadow-none sm:border sm:shadow-sm'>
                        <CardHeader className='space-y-1'>
                            <CardTitle className='text-2xl text-center'>
                                登录到您的账户
                            </CardTitle>
                            <CardDescription className='text-center'>
                                请输入您的用户名和密码以访问后台系统
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className='space-y-4'
                                >
                                    <FormField
                                        control={form.control as any}
                                        name='username'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>用户名</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder='请输入用户名'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control as any}
                                        name='password'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>密码</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type='password'
                                                        placeholder='请输入密码'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        className='w-full'
                                        type='submit'
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className='mr-2 w-4 h-4 animate-spin' />
                                                登录中...
                                            </>
                                        ) : (
                                            '登录'
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
