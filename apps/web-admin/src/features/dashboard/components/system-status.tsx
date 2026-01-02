import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Globe, ShieldCheck } from 'lucide-react';

export const SystemStatus = () => {
    // 模拟系统状态数据
    const statuses = [
        {
            name: 'API 服务',
            status: 'online',
            icon: Globe,
            latency: '45ms',
        },
        {
            name: '数据库',
            status: 'online',
            icon: Database,
            latency: '12ms',
        },
        {
            name: '认证中心',
            status: 'online',
            icon: ShieldCheck,
            latency: '28ms',
        },
        {
            name: '队列服务',
            status: 'online',
            icon: Activity,
            latency: 'idle',
        },
    ];

    return (
        <Card className="col-span-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    系统运行状态
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statuses.map((s) => (
                        <div key={s.name} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-muted">
                                    <s.icon className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{s.name}</p>
                                    <p className="text-xs text-muted-foreground">延迟: {s.latency}</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                运行中
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
