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
import { Loader2, ShieldCheck, Zap, Globe, Github } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/ui/logo';

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
        <div className='flex overflow-hidden relative flex-col justify-center items-center min-h-screen lg:max-w-none lg:grid-cols-2 lg:px-0 lg:grid'>
            <div className='hidden relative flex-col p-10 h-full text-white lg:flex'>
                <div className='absolute inset-0 bg-zinc-950' />
                <div
                    className='absolute inset-0 opacity-20'
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                        backgroundSize: '24px 24px',
                    }}
                />
                <div className='absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent' />

                <div className='flex relative z-20 items-center text-xl font-bold tracking-tight'>
                    <Logo className='mr-3 w-10 h-10' />
                    Nest Admin
                </div>

                <div className='relative z-20 mt-auto'>
                    <div className='space-y-6'>
                        <div className='space-y-2'>
                            <h2 className='text-3xl font-bold'>
                                全栈式后台管理解决方案
                            </h2>
                            <p className='text-zinc-400 max-w-[400px]'>
                                基于 NestJS + React + TypeORM
                                构建，提供企业级的权限管理、资源管理及支付集成。
                            </p>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div className='flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10'>
                                <ShieldCheck className='w-5 h-5 text-primary' />
                                <span className='text-sm'>权限安全控制</span>
                            </div>
                            <div className='flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10'>
                                <Zap className='w-5 h-5 text-primary' />
                                <span className='text-sm'>极致响应速度</span>
                            </div>
                            <div className='flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10'>
                                <Globe className='w-5 h-5 text-primary' />
                                <span className='text-sm'>多存储后端支持</span>
                            </div>
                            <div className='flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10'>
                                <Github className='w-5 h-5 text-primary' />
                                <span className='text-sm'>完全开源透明</span>
                            </div>
                        </div>

                        <blockquote className='pt-6 border-t border-white/10'>
                            <p className='text-lg italic text-zinc-300'>
                                &ldquo;这个系统节省了我无数的工作时间，帮助我更快地向客户交付出色的产品。&rdquo;
                            </p>
                            <footer className='mt-2 text-sm text-zinc-500'>
                                — 研发团队负责人
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>
            <div className='p-4 lg:p-8 bg-background'>
                <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]'>
                    <div className='flex flex-col space-y-2 text-center lg:hidden mb-4'>
                        <div className='flex justify-center mb-2'>
                            <Logo className='w-12 h-12' />
                        </div>
                        <h1 className='text-2xl font-semibold tracking-tight'>
                            Nest Admin
                        </h1>
                    </div>
                    <Card className='border-zinc-200 dark:border-zinc-800 shadow-xl'>
                        <CardHeader className='space-y-1 pb-8'>
                            <CardTitle className='text-2xl text-center font-bold'>
                                欢迎回来
                            </CardTitle>
                            <CardDescription className='text-center text-muted-foreground'>
                                请输入账号信息以访问管理后台
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className='space-y-5'
                                >
                                    <FormField
                                        control={form.control as any}
                                        name='username'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>用户名</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        className='h-11'
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
                                                        className='h-11'
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
                                        className='w-full h-11 text-base font-semibold'
                                        type='submit'
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className='mr-2 w-5 h-5 animate-spin' />
                                                登录中...
                                            </>
                                        ) : (
                                            '立即登录'
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                    <p className='px-8 text-center text-sm text-muted-foreground'>
                        登录即表示您同意我们的{' '}
                        <a
                            href='#'
                            className='underline underline-offset-4 hover:text-primary'
                        >
                            服务条款
                        </a>{' '}
                        和{' '}
                        <a
                            href='#'
                            className='underline underline-offset-4 hover:text-primary'
                        >
                            隐私政策
                        </a>
                        。
                    </p>
                </div>
            </div>
        </div>
    );
}
