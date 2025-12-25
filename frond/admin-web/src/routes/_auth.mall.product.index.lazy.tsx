import { createLazyFileRoute } from '@tanstack/react-router'
import ProductList from '@/features/mall/product/product-list'

export const Route = createLazyFileRoute('/_auth/mall/product/')({
  component: ProductList,
})
