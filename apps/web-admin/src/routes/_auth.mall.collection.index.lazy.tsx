import { createLazyFileRoute } from '@tanstack/react-router'
import CollectionList from '@/features/mall/collection/collection-list'

export const Route = createLazyFileRoute('/_auth/mall/collection/')({
  component: CollectionList,
})
