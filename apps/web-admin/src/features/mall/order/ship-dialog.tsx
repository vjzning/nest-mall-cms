import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shipOrder } from './api';
import type { Order, ShipOrderDto, OrderItem } from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ShipDialogProps {
    isOpen: boolean;
    onClose: () => void;
    order?: Order;
    isLoading?: boolean;
}

export function ShipDialog({
    isOpen,
    onClose,
    order,
    isLoading = false,
}: ShipDialogProps) {
    const queryClient = useQueryClient();
    const [trackingNo, setTrackingNo] = useState('');
    const [carrier, setCarrier] = useState('');
    const [remark, setRemark] = useState('');
    const [items, setItems] = useState<
        { skuId: number; quantity: number; max: number; name: string }[]
    >([]);

    const shipMutation = useMutation({
        mutationFn: (data: ShipOrderDto) => shipOrder(order!.id, data),
        onSuccess: () => {
            toast.success('订单发货成功');
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({
                queryKey: ['order', order?.id?.toString()],
            });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || '发货失败');
            console.error(err);
        },
    });

    // Reset form when order changes
    useEffect(() => {
        if (isOpen && order && !isLoading) {
            const timer = setTimeout(() => {
                // Filter items that can be shipped
                const shippable = (order.items || [])
                    .filter((i: OrderItem) => i.quantity > i.shippedQuantity)
                    .map((i: OrderItem) => ({
                        skuId: i.skuId,
                        quantity: i.quantity - i.shippedQuantity,
                        max: i.quantity - i.shippedQuantity,
                        name: i.productName,
                    }));
                setItems(shippable);
                setTrackingNo('');
                setCarrier('');
                setRemark('');
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen, order, isLoading]);

    const handleSubmit = () => {
        if (!trackingNo || !carrier) {
            toast.error('请填写物流信息');
            return;
        }
        const data: ShipOrderDto = {
            trackingNo,
            carrier,
            remark,
            items: items
                .filter((i) => i.quantity > 0)
                .map((i) => ({ skuId: i.skuId, quantity: i.quantity })),
        };
        shipMutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='sm:max-w-[600px]'>
                <DialogHeader>
                    <DialogTitle>订单发货 - {order?.orderNo}</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className='flex justify-center p-8'>
                        <Loader2 className='animate-spin' />
                    </div>
                ) : (
                    <div className='grid gap-4 py-4'>
                        <div className='grid grid-cols-4 gap-4 items-center'>
                            <Label className='text-right'>物流单号</Label>
                            <Input
                                value={trackingNo}
                                onChange={(e) => setTrackingNo(e.target.value)}
                                className='col-span-3'
                            />
                        </div>
                        <div className='grid grid-cols-4 gap-4 items-center'>
                            <Label className='text-right'>物流公司</Label>
                            <Input
                                value={carrier}
                                onChange={(e) => setCarrier(e.target.value)}
                                className='col-span-3'
                                placeholder='例如：顺丰快递'
                            />
                        </div>
                        <div className='grid grid-cols-4 gap-4 items-center'>
                            <Label className='text-right'>发货备注</Label>
                            <Input
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                className='col-span-3'
                                placeholder='选填'
                            />
                        </div>

                        <div className='pt-4 border-t'>
                            <Label className='block mb-2'>发货商品清单</Label>
                            <div className='max-h-[200px] overflow-y-auto border rounded'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>商品</TableHead>
                                            <TableHead className='w-[80px]'>
                                                剩余
                                            </TableHead>
                                            <TableHead className='w-[100px]'>
                                                本次发货
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, idx) => (
                                            <TableRow key={item.skuId}>
                                                <TableCell className='text-sm'>
                                                    {item.name}
                                                </TableCell>
                                                <TableCell>
                                                    {item.max}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type='number'
                                                        min={0}
                                                        max={item.max}
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const val = Number(
                                                                e.target.value
                                                            );
                                                            const newItems = [
                                                                ...items,
                                                            ];
                                                            newItems[
                                                                idx
                                                            ].quantity =
                                                                Math.min(
                                                                    Math.max(
                                                                        0,
                                                                        val
                                                                    ),
                                                                    item.max
                                                                );
                                                            setItems(newItems);
                                                        }}
                                                        className='h-8'
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant='outline' onClick={onClose}>
                        取消
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={shipMutation.isPending || isLoading}
                    >
                        {shipMutation.isPending && (
                            <Loader2 className='mr-2 w-4 h-4 animate-spin' />
                        )}
                        确认发货
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
