import { createLazyFileRoute } from '@tanstack/react-router'
import OrderList from '@/features/mall/order/order-list'

export const Route = createLazyFileRoute('/_auth/mall/order/')({
  component: OrderList,
})
