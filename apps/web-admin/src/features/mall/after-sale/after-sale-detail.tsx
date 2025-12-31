import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { afterSaleApi, AfterSaleStatusMap, AfterSaleTypeMap } from './api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Loader2,
    ArrowLeft,
    Truck,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    [AfterSaleStatusMap.APPLIED]: {
        label: '待审核',
        color: 'text-yellow-500',
        icon: AlertCircle,
    },
    [AfterSaleStatusMap.APPROVED]: {
        label: '审核通过',
        color: 'text-blue-500',
        icon: CheckCircle2,
    },
    [AfterSaleStatusMap.REJECTED]: {
        label: '审核驳回',
        color: 'text-red-500',
        icon: XCircle,
    },
    [AfterSaleStatusMap.WAITING_RECEIPT]: {
        label: '待收货',
        color: 'text-purple-500',
        icon: Truck,
    },
    [AfterSaleStatusMap.PROCESSING]: {
        label: '处理中',
        color: 'text-indigo-500',
        icon: Loader2,
    },
    [AfterSaleStatusMap.REFUNDED]: {
        label: '已退款',
        color: 'text-green-500',
        icon: CheckCircle2,
    },
    [AfterSaleStatusMap.COMPLETED]: {
        label: '已完成',
        color: 'text-slate-500',
        icon: CheckCircle2,
    },
    [AfterSaleStatusMap.CANCELLED]: {
        label: '已取消',
        color: 'text-gray-500',
        icon: XCircle,
    },
};

export default function AfterSaleDetail() {
    const { id } = useParams({ strict: false }) as { id: string };
    const queryClient = useQueryClient();

    const [auditOpen, setAuditOpen] = useState(false);
    const [resendOpen, setResendOpen] = useState(false);

    const [auditResult, setAuditResult] = useState({
        status: AfterSaleStatusMap.APPROVED as any,
        adminRemark: '',
        actualAmount: 0,
    });

    const [resendLogistics, setResendLogistics] = useState({
        carrier: '',
        trackingNo: '',
    });

    const { data: afterSale, isLoading } = useQuery({
        queryKey: ['after-sale', id],
        queryFn: () => afterSaleApi.findOne(Number(id)),
    });

    const auditMutation = useMutation({
        mutationFn: (data: any) => afterSaleApi.audit(Number(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['after-sale', id] });
            queryClient.invalidateQueries({ queryKey: ['after-sales'] });
            toast.success('审核处理成功');
            setAuditOpen(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || '操作失败');
        },
    });

    const confirmReceiptMutation = useMutation({
        mutationFn: () => afterSaleApi.confirmReceipt(Number(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['after-sale', id] });
            toast.success('确认收货成功');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || '操作失败');
        },
    });

    const resendMutation = useMutation({
        mutationFn: (data: any) =>
            afterSaleApi.resendLogistics(Number(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['after-sale', id] });
            toast.success('补发物流提交成功');
            setResendOpen(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || '操作失败');
        },
    });

    if (isLoading) {
        return (
            <div className='flex justify-center p-8'>
                <Loader2 className='animate-spin' />
            </div>
        );
    }

    if (!afterSale) return <div>未找到该售后申请</div>;

    const StatusIcon = statusMap[afterSale.status]?.icon || AlertCircle;

    return (
        <div className='flex flex-col gap-6 pb-10'>
            <div className='flex gap-4 items-center'>
                <Button variant='ghost' size='icon' asChild>
                    <Link to='/mall/after-sale'>
                        <ArrowLeft className='w-4 h-4' />
                    </Link>
                </Button>
                <h2 className='text-2xl font-bold tracking-tight'>售后详情</h2>
                <Badge
                    variant='outline'
                    className={statusMap[afterSale.status]?.color}
                >
                    {statusMap[afterSale.status]?.label}
                </Badge>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* 左侧主要信息 */}
                <div className='flex flex-col gap-6 md:col-span-2'>
                    <Card>
                        <CardHeader>
                            <CardTitle>基本信息</CardTitle>
                        </CardHeader>
                        <CardContent className='grid grid-cols-2 gap-y-4'>
                            <div>
                                <p className='text-sm text-muted-foreground'>
                                    售后单号
                                </p>
                                <p className='font-medium'>
                                    {afterSale.afterSaleNo}
                                </p>
                            </div>
                            <div>
                                <p className='text-sm text-muted-foreground'>
                                    申请时间
                                </p>
                                <p className='font-medium'>
                                    {format(
                                        new Date(afterSale.createdAt),
                                        'yyyy-MM-dd HH:mm:ss'
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className='text-sm text-muted-foreground'>
                                    售后类型
                                </p>
                                <p className='font-medium'>
                                    {afterSale.type ===
                                    AfterSaleTypeMap.REFUND_ONLY
                                        ? '仅退款'
                                        : afterSale.type ===
                                            AfterSaleTypeMap.RETURN_AND_REFUND
                                          ? '退货退款'
                                          : '换货'}
                                </p>
                            </div>
                            <div>
                                <p className='text-sm text-muted-foreground'>
                                    申请金额
                                </p>
                                <p className='font-medium text-red-500'>
                                    ¥{afterSale.applyAmount}
                                </p>
                            </div>
                            <div className='col-span-2'>
                                <p className='text-sm text-muted-foreground'>
                                    申请原因
                                </p>
                                <p className='font-medium'>
                                    {afterSale.applyReason}
                                </p>
                            </div>
                            {afterSale.description && (
                                <div className='col-span-2'>
                                    <p className='text-sm text-muted-foreground'>
                                        问题描述
                                    </p>
                                    <p className='font-medium'>
                                        {afterSale.description}
                                    </p>
                                </div>
                            )}
                            {afterSale.images &&
                                afterSale.images.length > 0 && (
                                    <div className='col-span-2'>
                                        <p className='text-sm text-muted-foreground'>
                                            凭证图片
                                        </p>
                                        <div className='flex gap-2 mt-2'>
                                            {afterSale.images.map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img}
                                                    className='object-cover w-20 h-20 rounded border'
                                                    alt=''
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>商品信息</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='flex flex-col gap-4'>
                                {afterSale.items?.map((item) => (
                                    <div
                                        key={item.id}
                                        className='flex gap-4 items-center'
                                    >
                                        <img
                                            src={item.orderItem?.productImg}
                                            className='object-cover w-16 h-16 rounded border'
                                            alt={item.orderItem?.productName}
                                        />
                                        <div className='flex-1'>
                                            <p className='text-sm font-medium'>
                                                {item.orderItem?.productName}
                                            </p>
                                            <p className='text-xs text-muted-foreground'>
                                                SKU: {item.orderItem?.skuSpecs ? 
                                                    (Array.isArray(item.orderItem.skuSpecs) 
                                                        ? item.orderItem.skuSpecs.map((s: any) => `${s.key}: ${s.value}`).join('; ')
                                                        : Object.entries(item.orderItem.skuSpecs).map(([k, v]) => `${k}: ${v}`).join('; '))
                                                    : item.skuId}
                                            </p>
                                        </div>
                                        <div className='text-right'>
                                            <p className='font-medium'>
                                                ¥{item.price}
                                            </p>
                                            <p className='text-xs text-muted-foreground'>
                                                x {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {afterSale.logistics && afterSale.logistics.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>物流信息</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='flex flex-col gap-4'>
                                    {afterSale.logistics.map((log) => (
                                        <div
                                            key={log.id}
                                            className='flex gap-4 items-start py-1 pl-4 border-l-2 border-primary/20'
                                        >
                                            <div className='flex-1'>
                                                <p className='text-sm font-medium'>
                                                    {log.type === 1
                                                        ? '用户寄回'
                                                        : '商家补发'}{' '}
                                                    - {log.carrier}
                                                </p>
                                                <p className='font-mono text-sm'>
                                                    {log.trackingNo}
                                                </p>
                                                <p className='text-xs text-muted-foreground'>
                                                    {format(
                                                        new Date(log.createdAt),
                                                        'yyyy-MM-dd HH:mm:ss'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* 右侧操作栏 */}
                <div className='flex flex-col gap-6'>
                    <Card>
                        <CardHeader>
                            <CardTitle>处理操作</CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-4'>
                            <div className='flex gap-2 items-center mb-2'>
                                <StatusIcon
                                    className={`h-5 w-5 ${statusMap[afterSale.status]?.color}`}
                                />
                                <span className='font-medium'>
                                    {statusMap[afterSale.status]?.label}
                                </span>
                            </div>

                            <Separator />

                            {afterSale.status ===
                                AfterSaleStatusMap.APPLIED && (
                                <Button
                                    onClick={() => {
                                        setAuditResult({
                                            ...auditResult,
                                            actualAmount: Number(
                                                afterSale.applyAmount
                                            ),
                                        });
                                        setAuditOpen(true);
                                    }}
                                >
                                    审核申请
                                </Button>
                            )}

                            {afterSale.status ===
                                AfterSaleStatusMap.WAITING_RECEIPT && (
                                <Button
                                    onClick={() =>
                                        confirmReceiptMutation.mutate()
                                    }
                                    disabled={confirmReceiptMutation.isPending}
                                >
                                    {confirmReceiptMutation.isPending && (
                                        <Loader2 className='mr-2 w-4 h-4 animate-spin' />
                                    )}
                                    确认收货并处理
                                </Button>
                            )}

                            {afterSale.status ===
                                AfterSaleStatusMap.PROCESSING &&
                                afterSale.type ===
                                    AfterSaleTypeMap.EXCHANGE && (
                                    <Button onClick={() => setResendOpen(true)}>
                                        填写补发物流
                                    </Button>
                                )}

                            {afterSale.adminRemark && (
                                <div className='mt-2'>
                                    <p className='text-sm text-muted-foreground'>
                                        管理员备注
                                    </p>
                                    <p className='text-sm italic'>
                                        "{afterSale.adminRemark}"
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>用户信息</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='flex flex-col gap-1'>
                                <p className='font-medium'>
                                    {afterSale.member?.nickname || '未知用户'}
                                </p>
                                <p className='text-sm text-muted-foreground'>
                                    {afterSale.member?.mobile}
                                </p>
                                <p className='mt-2 text-xs text-muted-foreground'>
                                    用户 ID: {afterSale.memberId}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>关联订单</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='flex flex-col gap-2'>
                                <p className='text-sm'>
                                    订单号: {afterSale.orderNo}
                                </p>
                                <Button variant='outline' size='sm' asChild>
                                    <Link
                                        to='/mall/order'
                                        search={{ orderNo: afterSale.orderNo }}
                                    >
                                        查看订单详情
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 审核弹窗 */}
            <Dialog open={auditOpen} onOpenChange={setAuditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>审核售后申请</DialogTitle>
                    </DialogHeader>
                    <div className='flex flex-col gap-4 py-4'>
                        <div className='flex flex-col gap-2'>
                            <p className='text-sm font-medium'>审核结果</p>
                            <div className='flex gap-4'>
                                <Button
                                    variant={
                                        auditResult.status ===
                                        AfterSaleStatusMap.APPROVED
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() =>
                                        setAuditResult({
                                            ...auditResult,
                                            status: AfterSaleStatusMap.APPROVED,
                                        })
                                    }
                                    className='flex-1'
                                >
                                    通过
                                </Button>
                                <Button
                                    variant={
                                        auditResult.status ===
                                        AfterSaleStatusMap.REJECTED
                                            ? 'destructive'
                                            : 'outline'
                                    }
                                    onClick={() =>
                                        setAuditResult({
                                            ...auditResult,
                                            status: AfterSaleStatusMap.REJECTED,
                                        })
                                    }
                                    className='flex-1'
                                >
                                    拒绝
                                </Button>
                            </div>
                        </div>

                        {auditResult.status === AfterSaleStatusMap.APPROVED && (
                            <div className='flex flex-col gap-2'>
                                <p className='text-sm font-medium'>实退金额</p>
                                <Input
                                    type='number'
                                    value={auditResult.actualAmount}
                                    onChange={(e) =>
                                        setAuditResult({
                                            ...auditResult,
                                            actualAmount: Number(
                                                e.target.value
                                            ),
                                        })
                                    }
                                />
                                <p className='text-xs text-muted-foreground'>
                                    最高可退: ¥{afterSale.applyAmount}
                                </p>
                            </div>
                        )}

                        <div className='flex flex-col gap-2'>
                            <p className='text-sm font-medium'>审核备注</p>
                            <Textarea
                                placeholder='请输入处理意见...'
                                value={auditResult.adminRemark}
                                onChange={(e) =>
                                    setAuditResult({
                                        ...auditResult,
                                        adminRemark: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => setAuditOpen(false)}
                        >
                            取消
                        </Button>
                        <Button
                            disabled={auditMutation.isPending}
                            onClick={() => auditMutation.mutate(auditResult)}
                        >
                            {auditMutation.isPending && (
                                <Loader2 className='mr-2 w-4 h-4 animate-spin' />
                            )}
                            确认提交
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 补发物流弹窗 */}
            <Dialog open={resendOpen} onOpenChange={setResendOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>填写补发物流</DialogTitle>
                    </DialogHeader>
                    <div className='flex flex-col gap-4 py-4'>
                        <div className='flex flex-col gap-2'>
                            <p className='text-sm font-medium'>物流公司</p>
                            <Input
                                placeholder='如：顺丰速运、圆通快递'
                                value={resendLogistics.carrier}
                                onChange={(e) =>
                                    setResendLogistics({
                                        ...resendLogistics,
                                        carrier: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-sm font-medium'>物流单号</p>
                            <Input
                                placeholder='请输入快递单号'
                                value={resendLogistics.trackingNo}
                                onChange={(e) =>
                                    setResendLogistics({
                                        ...resendLogistics,
                                        trackingNo: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => setResendOpen(false)}
                        >
                            取消
                        </Button>
                        <Button
                            disabled={
                                resendMutation.isPending ||
                                !resendLogistics.carrier ||
                                !resendLogistics.trackingNo
                            }
                            onClick={() =>
                                resendMutation.mutate(resendLogistics)
                            }
                        >
                            {resendMutation.isPending && (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            )}
                            确认提交
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
