import { createLazyFileRoute } from '@tanstack/react-router'
import ShippingTemplateForm from '@/features/mall/shipping-template/shipping-template-form'

export const Route = createLazyFileRoute('/_auth/mall/shipping-template/edit/$id')({
  component: ShippingTemplateForm,
})
