import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    FileText, 
    PlusCircle, 
    ShoppingBag, 
    History, 
    Image as ImageIcon,
    Users
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

const actions = [
    {
        title: '发布文章',
        icon: FileText,
        href: '/cms/article',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
    },
    {
        title: '上架商品',
        icon: PlusCircle,
        href: '/mall/product/create',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
    },
    {
        title: '订单管理',
        icon: ShoppingBag,
        href: '/mall/order',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
    },
    {
        title: '资源管理',
        icon: ImageIcon,
        href: '/cms/resource',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
    },
    {
        title: '用户管理',
        icon: Users,
        href: '/system/user',
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500/10',
    },
    {
        title: '系统日志',
        icon: History,
        href: '/system/log',
        color: 'text-slate-500',
        bgColor: 'bg-slate-500/10',
    },
];

export const QuickActions = () => {
    const navigate = useNavigate();

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">快捷操作</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {actions.map((action) => (
                        <Button
                            key={action.title}
                            variant="ghost"
                            className="flex flex-col items-center justify-center h-20 gap-1.5 hover:bg-muted group border border-transparent hover:border-border px-2"
                            onClick={() => navigate({ to: action.href })}
                        >
                            <div className={`p-2 rounded-lg ${action.bgColor} ${action.color} transition-transform group-hover:scale-105`}>
                                <action.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-medium text-center line-clamp-1">{action.title}</span>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
