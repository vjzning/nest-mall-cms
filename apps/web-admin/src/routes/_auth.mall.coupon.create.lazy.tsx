import { createLazyFileRoute } from '@tanstack/react-router'
import CouponFormPage from '@/features/mall/coupon/coupon-form-page'

export const Route = createLazyFileRoute('/_auth/mall/coupon/create')({
  component: CouponFormPage,
})
