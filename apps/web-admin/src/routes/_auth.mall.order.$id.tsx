import { createFileRoute } from '@tanstack/react-router';
import OrderDetail from '@/features/mall/order/order-detail';

export const Route = createFileRoute('/_auth/mall/order/$id')({
  component: OrderDetail,
});
