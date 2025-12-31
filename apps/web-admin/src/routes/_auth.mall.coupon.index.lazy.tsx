import { createLazyFileRoute } from '@tanstack/react-router'
import CouponList from '@/features/mall/coupon/coupon-list'

export const Route = createLazyFileRoute('/_auth/mall/coupon/')({
  component: CouponList,
})
