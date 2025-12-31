import { createLazyFileRoute } from '@tanstack/react-router'
import ShippingTemplateList from '@/features/mall/shipping-template/shipping-template-list'

export const Route = createLazyFileRoute('/_auth/mall/shipping-template/')({
  component: ShippingTemplateList,
})
