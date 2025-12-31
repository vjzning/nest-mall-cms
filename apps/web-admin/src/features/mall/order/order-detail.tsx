import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from '@tanstack/react-router';
import { getOrder, OrderStatus } from './api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Loader2,
    ArrowLeft,
    User,
    MapPin,
    CreditCard,
    Package,
    Truck,
} from 'lucide-react';
import { format } from 'date-fns';
import { ShipDialog } from './ship-dialog';

const orderStatusMap: Record<string, { label: string; color: string }> = {
    [OrderStatus.PENDING_PAY]: {
        label: '待付款',
        color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    },
    [OrderStatus.PENDING_DELIVERY]: {
        label: '待发货',
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    [OrderStatus.PARTIALLY_SHIPPED]: {
        label: '部分发货',
        color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    },
    [OrderStatus.SHIPPED]: {
        label: '已发货',
        color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    },
    [OrderStatus.DELIVERED]: {
        label: '已送达',
        color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    },
    [OrderStatus.COMPLETED]: {
        label: '已完成',
        color: 'bg-green-500/10 text-green-500 border-green-500/20',
    },
    [OrderStatus.CANCELLED]: {
        label: '已取消',
        color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    },
};

export default function OrderDetail() {
    const { id } = useParams({ strict: false }) as { id: string };
    const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);

    const { data: order, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: () => getOrder(Number(id)),
    });

    if (isLoading) {
        return (
            <div className='flex justify-center p-8'>
                <Loader2 className='animate-spin' />
            </div>
        );
    }

    if (!order) return <div className='p-8 text-center'>未找到该订单</div>;

    return (
        <div className='flex flex-col gap-6 pb-10'>
            <div className='flex gap-4 justify-between items-center'>
                <div className='flex gap-4 items-center'>
                    <Button variant='ghost' size='icon' asChild>
                        <Link to='/mall/order'>
                            <ArrowLeft className='w-4 h-4' />
                        </Link>
                    </Button>
                    <h2 className='text-2xl font-bold tracking-tight'>
                        订单详情
                    </h2>
                    <Badge
                        variant='outline'
                        className={orderStatusMap[order.status]?.color}
                    >
                        {orderStatusMap[order.status]?.label}
                    </Badge>
                </div>

                {(order.status === OrderStatus.PENDING_DELIVERY ||
                    order.status === OrderStatus.PARTIALLY_SHIPPED) && (
                    <Button onClick={() => setIsShipDialogOpen(true)}>
                        <Truck className='mr-2 w-4 h-4' />
                        发货
                    </Button>
                )}
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* 左侧主要信息 */}
                <div className='flex flex-col gap-6 md:col-span-2'>
                    {/* 基本信息 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex gap-2 items-center text-base'>
                                <Package className='w-4 h-4' />
                                基本信息
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='grid grid-cols-2 gap-y-4'>
                            <div>
                                <p className='text-sm text-muted-foreground'>
                                    订单号
                                </p>
                                <p className='font-medium'>{order.orderNo}</p>
                            </div>
                            <div>
                                <p className='text-sm text-muted-foreground'>
                                    下单时间
                                </p>
                                <p className='font-medium'>
                                    {format(
                                        new Date(order.createdAt),
                                        'yyyy-MM-dd HH:mm:ss'
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className='text-sm text-muted-foreground'>
                                    订单总额
                                </p>
                                <p className='font-medium text-red-500'>
                                    ¥{order.totalAmount}
                                </p>
                            </div>
                            <div>
                                <p className='text-sm text-muted-foreground'>
                                    实付金额
                                </p>
                                <p className='font-medium text-red-500'>
                                    ¥{order.payAmount}
                                </p>
                            </div>
                            {order.remark && (
                                <div className='col-span-2'>
                                    <p className='text-sm text-muted-foreground'>
                                        订单备注
                                    </p>
                                    <p className='font-medium text-yellow-600'>
                                        {order.remark}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 商品信息 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex gap-2 items-center text-base'>
                                <CreditCard className='w-4 h-4' />
                                商品信息
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='flex flex-col gap-4'>
                                {order.items?.map((item) => (
                                    <div
                                        key={item.id}
                                        className='flex gap-4 items-center'
                                    >
                                        <img
                                            src={item.productImg}
                                            className='object-cover w-16 h-16 rounded border'
                                            alt={item.productName}
                                        />
                                        <div className='flex-1'>
                                            <p className='text-sm font-medium'>
                                                {item.productName}
                                            </p>
                                            <p className='text-xs text-muted-foreground'>
                                                规格:{' '}
                                                {item.skuSpecs
                                                    ? typeof item.skuSpecs ===
                                                      'string'
                                                        ? item.skuSpecs
                                                        : Array.isArray(
                                                                item.skuSpecs
                                                            )
                                                          ? item.skuSpecs
                                                                .map(
                                                                    (s: {
                                                                        key: string;
                                                                        value: string;
                                                                    }) =>
                                                                        `${s.key}: ${s.value}`
                                                                )
                                                                .join('; ')
                                                          : Object.entries(
                                                                item.skuSpecs
                                                            )
                                                                .map(
                                                                    ([k, v]) =>
                                                                        `${k}: ${v}`
                                                                )
                                                                .join('; ')
                                                    : '无'}
                                            </p>
                                        </div>
                                        <div className='text-right'>
                                            <p className='font-medium'>
                                                ¥{item.price}
                                            </p>
                                            <p className='text-xs text-muted-foreground'>
                                                x {item.quantity}
                                            </p>
                                            {item.shippedQuantity > 0 && (
                                                <p className='text-xs text-blue-500'>
                                                    已发货:{' '}
                                                    {item.shippedQuantity}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 物流记录 */}
                    {order.deliveries && order.deliveries.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex gap-2 items-center text-base'>
                                    <Truck className='w-4 h-4' />
                                    发货记录
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='flex flex-col gap-4'>
                                    {order.deliveries.map((delivery) => (
                                        <div
                                            key={delivery.id}
                                            className='flex flex-col gap-1 py-2 border-b last:border-0'
                                        >
                                            <div className='flex justify-between items-center'>
                                                <span className='font-medium'>
                                                    {delivery.deliveryCompany}
                                                </span>
                                                <span className='text-xs text-muted-foreground'>
                                                    {format(
                                                        new Date(
                                                            delivery.createdAt
                                                        ),
                                                        'yyyy-MM-dd HH:mm'
                                                    )}
                                                </span>
                                            </div>
                                            <p className='font-mono text-sm'>
                                                {delivery.deliverySn}
                                            </p>
                                            {delivery.remark && (
                                                <p className='text-xs text-muted-foreground'>
                                                    备注: {delivery.remark}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* 右侧辅助信息 */}
                <div className='flex flex-col gap-6'>
                    {/* 用户信息 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex gap-2 items-center text-base'>
                                <User className='w-4 h-4' />
                                会员信息
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2 text-sm'>
                            <div className='flex justify-between'>
                                <span className='text-muted-foreground'>
                                    会员 ID
                                </span>
                                <span>{order.memberId}</span>
                            </div>
                            {order.member && (
                                <>
                                    <div className='flex justify-between'>
                                        <span className='text-muted-foreground'>
                                            昵称
                                        </span>
                                        <span>{order.member.nickname}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-muted-foreground'>
                                            手机号
                                        </span>
                                        <span>{order.member.mobile}</span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* 收货信息 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex gap-2 items-center text-base'>
                                <MapPin className='w-4 h-4' />
                                收货信息
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2 text-sm'>
                            <div className='flex justify-between'>
                                <span className='text-muted-foreground'>
                                    收货人
                                </span>
                                <span className='font-medium'>
                                    {order.receiverInfo?.name}
                                </span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='text-muted-foreground'>
                                    联系电话
                                </span>
                                <span>
                                    {order.receiverInfo?.mobile ||
                                        order.receiverInfo?.phone}
                                </span>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <span className='text-muted-foreground'>
                                    收货地址
                                </span>
                                <span className='leading-relaxed'>
                                    {order.receiverInfo?.province}{' '}
                                    {order.receiverInfo?.city}{' '}
                                    {order.receiverInfo?.district}{' '}
                                    {order.receiverInfo?.detail ||
                                        order.receiverInfo?.address}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 支付信息 */}
                    {order.payment && (
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex gap-2 items-center text-base'>
                                    <CreditCard className='w-4 h-4' />
                                    支付信息
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-2 text-sm'>
                                <div className='flex justify-between'>
                                    <span className='text-muted-foreground'>
                                        支付方式
                                    </span>
                                    <span>
                                        {order.payment.paymentMethod ===
                                        'wechat'
                                            ? '微信支付'
                                            : order.payment.paymentMethod}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-muted-foreground'>
                                        交易单号
                                    </span>
                                    <span className='font-mono text-xs'>
                                        {order.payment.transactionId}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='text-muted-foreground'>
                                        支付时间
                                    </span>
                                    <span>
                                        {order.payment.paidAt
                                            ? format(
                                                  new Date(
                                                      order.payment.paidAt
                                                  ),
                                                  'yyyy-MM-dd HH:mm:ss'
                                              )
                                            : '-'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <ShipDialog
                isOpen={isShipDialogOpen}
                onClose={() => setIsShipDialogOpen(false)}
                order={order}
            />
        </div>
    );
}
