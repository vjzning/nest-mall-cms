import {
    Bell,
    Package,
    Truck,
    MessageSquare,
    Check,
    Settings,
    Mail,
    Info,
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    notificationApi,
    type NotificationSetting,
} from '@/features/notification/api';
import { useAuthStore } from '@/stores/auth.store';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const getIcon = (type: string) => {
    switch (type) {
        case 'STOCK_ZERO':
            return <Package className='w-4 h-4 text-destructive' />;
        case 'ORDER_TIMEOUT':
            return <Truck className='w-4 h-4 text-orange-500' />;
        case 'AFTERSALE_TIMEOUT':
            return <MessageSquare className='w-4 h-4 text-yellow-500' />;
        default:
            return <Bell className='w-4 h-4' />;
    }
};

export function NotificationCenter() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const { data: notifications } = useQuery({
        queryKey: ['notifications', 'ADMIN', user?.id],
        queryFn: () =>
            notificationApi.findAll({
                targetType: 'ADMIN',
                targetId: user?.id,
                limit: 20,
            }),
        enabled: !!user,
        refetchInterval: 30000, // 每 30 秒轮询一次
    });

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['notifications', 'unread-count', 'ADMIN', user?.id],
        queryFn: () =>
            user ? notificationApi.getUnreadCount('ADMIN', user.id) : 0,
        enabled: !!user,
        refetchInterval: 30000,
    });

    const markAsReadMutation = useMutation({
        mutationFn: (id: number) => notificationApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: () =>
            user
                ? notificationApi.markAllAsRead('ADMIN', user.id)
                : Promise.resolve(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='ghost' size='icon' className='relative'>
                    <Bell className='w-5 h-5' />
                    {unreadCount > 0 && (
                        <span className='absolute top-2 right-2 flex h-2 w-2'>
                            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75'></span>
                            <span className='relative inline-flex rounded-full h-2 w-2 bg-destructive'></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80 p-0' align='end'>
                <div className='flex items-center justify-between p-4'>
                    <h4 className='font-semibold text-sm'>通知中心</h4>
                    <div className='flex items-center gap-2'>
                        {unreadCount > 0 && (
                            <Badge
                                variant='secondary'
                                className='font-normal py-0 px-1.5 text-[10px]'
                            >
                                {unreadCount} 条未读
                            </Badge>
                        )}
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                            title='通知设置'
                            onClick={() => setIsSettingsOpen(true)}
                        >
                            <Settings className='h-3.5 w-3.5 text-muted-foreground' />
                        </Button>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                            title='全部标记为已读'
                            onClick={() => markAllAsReadMutation.mutate()}
                            disabled={unreadCount === 0}
                        >
                            <Check className='h-3 w-3' />
                        </Button>
                    </div>
                </div>
                <Separator />
                <ScrollArea className='h-[350px]'>
                    {notifications?.items && notifications.items.length > 0 ? (
                        <div className='flex flex-col'>
                            {notifications.items.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() =>
                                        notification.isRead === 0 &&
                                        markAsReadMutation.mutate(
                                            notification.id
                                        )
                                    }
                                    className={cn(
                                        'flex flex-col gap-1 p-4 transition-colors hover:bg-muted/50 cursor-pointer relative border-b last:border-0',
                                        notification.isRead === 0 &&
                                            'bg-muted/30'
                                    )}
                                >
                                    <div className='flex items-center gap-2'>
                                        {getIcon(notification.type)}
                                        <span
                                            className={cn(
                                                'text-xs font-medium',
                                                notification.isRead === 0
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground'
                                            )}
                                        >
                                            {notification.title}
                                        </span>
                                        <span className='text-[10px] text-muted-foreground ml-auto'>
                                            {formatDistanceToNow(
                                                new Date(
                                                    notification.createdAt
                                                ),
                                                {
                                                    addSuffix: true,
                                                    locale: zhCN,
                                                }
                                            )}
                                        </span>
                                    </div>
                                    <p
                                        className={cn(
                                            'text-[11px] leading-relaxed line-clamp-2',
                                            notification.isRead === 0
                                                ? 'text-muted-foreground'
                                                : 'text-muted-foreground/60'
                                        )}
                                    >
                                        {notification.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='flex flex-col items-center justify-center h-full py-10 text-muted-foreground'>
                            <Bell className='w-8 h-8 mb-2 opacity-20' />
                            <p className='text-xs'>暂无通知</p>
                        </div>
                    )}
                </ScrollArea>
                <Separator />
                <Button
                    variant='ghost'
                    className='w-full text-xs h-9 rounded-none font-normal text-muted-foreground hover:text-foreground'
                >
                    查看全部通知
                </Button>
            </PopoverContent>

            <NotificationSettingsDialog
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
            />
        </Popover>
    );
}

function NotificationSettingsDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const queryClient = useQueryClient();
    const { data: settings, isLoading } = useQuery({
        queryKey: ['notification-settings'],
        queryFn: notificationApi.findAllSettings,
        enabled: open,
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: Partial<NotificationSetting>;
        }) => notificationApi.updateSetting(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['notification-settings'],
            });
            toast.success('设置已保存');
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-3xl'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Settings className='w-5 h-5' />
                        通知设置
                    </DialogTitle>
                </DialogHeader>
                <div className='py-4 max-h-[70vh] overflow-y-auto pr-2'>
                    {isLoading ? (
                        <div className='flex items-center justify-center py-10'>
                            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {settings && settings.length > 0 ? (
                                settings.map((setting) => (
                                    <div
                                        key={setting.id}
                                        className='flex flex-col gap-3 p-3 rounded-lg border bg-muted/30 h-full'
                                    >
                                        <div className='flex items-center justify-between'>
                                            <div className='flex flex-col gap-0.5'>
                                                <span className='text-sm font-medium'>
                                                    {setting.description ||
                                                        setting.type}
                                                </span>
                                                <span className='text-[10px] text-muted-foreground'>
                                                    类型: {setting.type}
                                                </span>
                                            </div>
                                            <Switch
                                                checked={setting.isEnabled}
                                                onCheckedChange={(checked) =>
                                                    updateMutation.mutate({
                                                        id: setting.id,
                                                        data: {
                                                            isEnabled: checked,
                                                        },
                                                    })
                                                }
                                            />
                                        </div>

                                        {setting.isEnabled && (
                                            <div className='flex flex-col gap-3 pt-2 border-t border-dashed'>
                                                <div className='flex items-center gap-4'>
                                                    <div className='flex items-center gap-2'>
                                                        <Checkbox
                                                            id={`web-${setting.id}`}
                                                            checked={setting.channels.includes(
                                                                'WEB'
                                                            )}
                                                            onCheckedChange={(
                                                                checked
                                                            ) => {
                                                                const channels =
                                                                    checked
                                                                        ? [
                                                                              ...setting.channels,
                                                                              'WEB',
                                                                          ]
                                                                        : setting.channels.filter(
                                                                              (
                                                                                  c
                                                                              ) =>
                                                                                  c !==
                                                                                  'WEB'
                                                                          );
                                                                updateMutation.mutate(
                                                                    {
                                                                        id: setting.id,
                                                                        data: {
                                                                            channels,
                                                                        },
                                                                    }
                                                                );
                                                            }}
                                                        />
                                                        <Label
                                                            htmlFor={`web-${setting.id}`}
                                                            className='text-xs cursor-pointer flex items-center gap-1'
                                                        >
                                                            <Bell className='w-3 h-3' />
                                                            站内信
                                                        </Label>
                                                    </div>
                                                    <div className='flex items-center gap-2'>
                                                        <Checkbox
                                                            id={`email-${setting.id}`}
                                                            checked={setting.channels.includes(
                                                                'EMAIL'
                                                            )}
                                                            onCheckedChange={(
                                                                checked
                                                            ) => {
                                                                const channels =
                                                                    checked
                                                                        ? [
                                                                              ...setting.channels,
                                                                              'EMAIL',
                                                                          ]
                                                                        : setting.channels.filter(
                                                                              (
                                                                                  c
                                                                              ) =>
                                                                                  c !==
                                                                                  'EMAIL'
                                                                          );
                                                                updateMutation.mutate(
                                                                    {
                                                                        id: setting.id,
                                                                        data: {
                                                                            channels,
                                                                        },
                                                                    }
                                                                );
                                                            }}
                                                        />
                                                        <Label
                                                            htmlFor={`email-${setting.id}`}
                                                            className='text-xs cursor-pointer flex items-center gap-1'
                                                        >
                                                            <Mail className='w-3 h-3' />
                                                            邮件通知
                                                        </Label>
                                                    </div>
                                                </div>

                                                {setting.channels.includes(
                                                    'EMAIL'
                                                ) && (
                                                    <div className='grid grid-cols-2 gap-3'>
                                                        <div className='space-y-2'>
                                                            <Label className='text-[10px] text-muted-foreground flex items-center gap-1'>
                                                                <Info className='w-3 h-3' />
                                                                收件邮箱
                                                                (逗号隔开)
                                                            </Label>
                                                            <Input
                                                                className='h-8 text-xs'
                                                                defaultValue={setting.adminEmails?.join(
                                                                    ', '
                                                                )}
                                                                onBlur={(e) => {
                                                                    const emails =
                                                                        e.target.value
                                                                            .split(
                                                                                ','
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    s
                                                                                ) =>
                                                                                    s.trim()
                                                                            )
                                                                            .filter(
                                                                                Boolean
                                                                            );
                                                                    if (
                                                                        JSON.stringify(
                                                                            emails
                                                                        ) !==
                                                                        JSON.stringify(
                                                                            setting.adminEmails
                                                                        )
                                                                    ) {
                                                                        updateMutation.mutate(
                                                                            {
                                                                                id: setting.id,
                                                                                data: {
                                                                                    adminEmails:
                                                                                        emails,
                                                                                },
                                                                            }
                                                                        );
                                                                    }
                                                                }}
                                                                placeholder='example@mail.com'
                                                            />
                                                        </div>
                                                        <div className='space-y-2'>
                                                            <Label className='text-[10px] text-muted-foreground flex items-center gap-1'>
                                                                <Info className='w-3 h-3' />
                                                                管理员 ID
                                                                (逗号隔开)
                                                            </Label>
                                                            <Input
                                                                className='h-8 text-xs'
                                                                defaultValue={setting.adminUserIds?.join(
                                                                    ', '
                                                                )}
                                                                onBlur={(e) => {
                                                                    const ids =
                                                                        e.target.value
                                                                            .split(
                                                                                ','
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    s
                                                                                ) =>
                                                                                    parseInt(
                                                                                        s.trim()
                                                                                    )
                                                                            )
                                                                            .filter(
                                                                                (
                                                                                    n
                                                                                ) =>
                                                                                    !isNaN(
                                                                                        n
                                                                                    )
                                                                            );
                                                                    if (
                                                                        JSON.stringify(
                                                                            ids
                                                                        ) !==
                                                                        JSON.stringify(
                                                                            setting.adminUserIds
                                                                        )
                                                                    ) {
                                                                        updateMutation.mutate(
                                                                            {
                                                                                id: setting.id,
                                                                                data: {
                                                                                    adminUserIds:
                                                                                        ids,
                                                                                },
                                                                            }
                                                                        );
                                                                    }
                                                                }}
                                                                placeholder='1, 2, 3'
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className='col-span-1 md:col-span-2 flex flex-col items-center justify-center py-10 text-muted-foreground'>
                                    <Settings className='w-10 h-10 mb-2 opacity-20' />
                                    <p className='text-sm'>暂无通知配置</p>
                                    <p className='text-xs opacity-60'>
                                        请确保后端已初始化默认配置
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
