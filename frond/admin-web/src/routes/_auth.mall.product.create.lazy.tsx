import { createLazyFileRoute } from '@tanstack/react-router'
import ProductFormPage from '@/features/mall/product/product-form-page'

export const Route = createLazyFileRoute('/_auth/mall/product/create')({
  component: ProductFormPage,
})
