import { createLazyFileRoute } from '@tanstack/react-router'
import CategoryList from '@/features/category/category-list'

export const Route = createLazyFileRoute('/_auth/cms/category')({
  component: CategoryList,
})
