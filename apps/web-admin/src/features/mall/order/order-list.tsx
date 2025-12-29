
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, getOrder, shipOrder, OrderStatus, type ShipItemDto } from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Search, Truck, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

export default function OrderList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orderNo, setOrderNo] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');

  // Drawer & Dialog State
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isShipDialogOpen, setIsShipDialogOpen] = useState(false);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, pageSize, orderNo, status],
    queryFn: () => getOrders({
      page,
      pageSize,
      orderNo: orderNo || undefined,
      status: status === 'ALL' ? undefined : status
    }),
  });

  // Selected Order Detail Query (enabled when drawer or ship dialog is open)
  const { data: selectedOrder, isLoading: isDetailLoading } = useQuery({
    queryKey: ['order', selectedOrderId],
    queryFn: () => getOrder(selectedOrderId!),
    enabled: !!selectedOrderId,
  });

  const handleSearch = () => {
    setPage(1);
  };

  const handleView = (id: number) => {
    setSelectedOrderId(id);
    setIsDrawerOpen(true);
  };

  const handleShip = (id: number) => {
    setSelectedOrderId(id);
    setIsShipDialogOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedOrderId(null);
  };

  const closeShipDialog = () => {
    setIsShipDialogOpen(false);
    setSelectedOrderId(null);
  };

  // Shipping Form State
  const [trackingNo, setTrackingNo] = useState('');
  const [carrier, setCarrier] = useState('');
  const [shipItems, setShipItems] = useState<{ skuId: number, quantity: number, max: number }[]>([]);

  // Initialize ship items when selected order loads
  // Use useEffect to sync local state when selectedOrder changes and matches the shipping context
  // Or just derive it. But we need to edit quantity.

  // Actually, better to separate ShipForm component, but I'll put it inline for now or use Effect.

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Order Management</h2>
          <p className="text-muted-foreground">View and manage orders</p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-background/95 p-1 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Order No..."
            className="pl-8"
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Select value={status} onValueChange={(val: any) => setStatus(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            {Object.values(OrderStatus).map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="secondary" onClick={handleSearch}>Search</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order No</TableHead>
              <TableHead>Member ID</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="animate-spin inline-block" />
                </TableCell>
              </TableRow>
            ) : data?.items.map(order => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNo}</TableCell>
                <TableCell>{order.memberId}</TableCell>
                <TableCell>¥{order.totalAmount}</TableCell>
                <TableCell>
                  <Badge variant={
                    order.status === OrderStatus.COMPLETED ? 'default' :
                      order.status === OrderStatus.CANCELLED ? 'destructive' : 'secondary'
                  }>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => handleView(order.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {(order.status === OrderStatus.PENDING_DELIVERY || order.status === OrderStatus.PARTIALLY_SHIPPED) && (
                      <Button variant="ghost" size="icon" onClick={() => handleShip(order.id)}>
                        <Truck className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        {/* ... (Reuse pagination logic or component) ... */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Total {data?.total || 0} items</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">Page {page}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page * pageSize >= (data?.total || 0)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detail Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>Order # {selectedOrder?.orderNo}</SheetDescription>
          </SheetHeader>

          {isDetailLoading || !selectedOrder ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="space-y-6 mt-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="font-medium">{selectedOrder.status}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Amount</Label>
                  <div className="font-medium">¥{selectedOrder.totalAmount}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created At</Label>
                  <div className="font-medium">{format(new Date(selectedOrder.createdAt), 'yyyy-MM-dd HH:mm')}</div>
                </div>
                {selectedOrder.payment && (
                  <div>
                    <Label className="text-muted-foreground">Payment Method</Label>
                    <div className="font-medium">{selectedOrder.payment.paymentMethod}</div>
                  </div>
                )}
              </div>

              {/* Receiver Info */}
              <div>
                <h3 className="font-semibold mb-2">Receiver Info</h3>
                <div className="text-sm border p-3 rounded bg-muted/20">
                  {selectedOrder.receiverInfo ? (
                    <>
                      <p><span className="font-medium">Name:</span> {selectedOrder.receiverInfo.name}</p>
                      <p><span className="font-medium">Phone:</span> {selectedOrder.receiverInfo.phone}</p>
                      <p><span className="font-medium">Address:</span> {selectedOrder.receiverInfo.address}</p>
                    </>
                  ) : 'No receiver info'}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Shipped</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {item.productImg && <img src={item.productImg} className="w-8 h-8 rounded object-cover" />}
                              <span className="truncate max-w-[150px]" title={item.productName}>{item.productName}</span>
                            </div>
                          </TableCell>
                          <TableCell>¥{item.price}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.shippedQuantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Deliveries */}
              {selectedOrder.deliveries && selectedOrder.deliveries.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Deliveries</h3>
                  <div className="space-y-2">
                    {selectedOrder.deliveries.map(d => (
                      <div key={d.id} className="border p-3 rounded text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{d.deliveryCompany}</span>
                          <span>{d.deliverySn}</span>
                        </div>
                        <div className="text-muted-foreground text-xs mt-1">
                          {format(new Date(d.createdAt), 'yyyy-MM-dd HH:mm')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Ship Dialog */}
      <ShipDialog
        isOpen={isShipDialogOpen}
        onClose={closeShipDialog}
        order={selectedOrder}
        isLoading={isDetailLoading}
      />
    </div>
  );
}

function ShipDialog({ isOpen, onClose, order, isLoading }: { isOpen: boolean, onClose: () => void, order?: any, isLoading: boolean }) {
  const queryClient = useQueryClient();
  const [trackingNo, setTrackingNo] = useState('');
  const [carrier, setCarrier] = useState('');
  const [items, setItems] = useState<{ skuId: number, quantity: number, max: number, name: string }[]>([]);

  const shipMutation = useMutation({
    mutationFn: (data: any) => shipOrder(order.id, data),
    onSuccess: () => {
      toast.success('Order shipped successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', order.id] });
      onClose();
    },
    onError: (err) => {
      toast.error('Failed to ship order');
      console.error(err);
    }
  });

  // Reset form when order changes
  if (isOpen && order && items.length === 0 && !isLoading) {
    // Filter items that can be shipped
    const shippable = order.items.filter((i: any) => i.quantity > i.shippedQuantity).map((i: any) => ({
      skuId: i.skuId,
      quantity: i.quantity - i.shippedQuantity,
      max: i.quantity - i.shippedQuantity,
      name: i.productName
    }));
    if (shippable.length > 0 && items.length === 0) {
      setItems(shippable);
    }
  }

  // Clear items on close
  if (!isOpen && items.length > 0) setItems([]);

  const handleSubmit = () => {
    if (!trackingNo || !carrier) {
      toast.error('Please fill logistics info');
      return;
    }
    const data = {
      trackingNo,
      carrier,
      items: items.filter(i => i.quantity > 0).map(i => ({ skuId: i.skuId, quantity: i.quantity }))
    };
    shipMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ship Order {order?.orderNo}</DialogTitle>
        </DialogHeader>

        {isLoading ? <Loader2 className="animate-spin" /> : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Tracking No</Label>
              <Input value={trackingNo} onChange={e => setTrackingNo(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Carrier</Label>
              <Input value={carrier} onChange={e => setCarrier(e.target.value)} className="col-span-3" placeholder="e.g. SF Express" />
            </div>

            <div className="border-t pt-4">
              <Label className="mb-2 block">Items to Ship</Label>
              <div className="max-h-[200px] overflow-y-auto border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="w-[80px]">Max</TableHead>
                      <TableHead className="w-[100px]">Ship Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={item.skuId}>
                        <TableCell className="text-sm">{item.name}</TableCell>
                        <TableCell>{item.max}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={item.max}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const newItems = [...items];
                              newItems[idx].quantity = Math.min(Math.max(0, val), item.max);
                              setItems(newItems);
                            }}
                            className="h-8"
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={shipMutation.isPending}>
            {shipMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Ship
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
