import { createLazyFileRoute } from '@tanstack/react-router'
import CollectionFormPage from '@/features/mall/collection/collection-form-page'

export const Route = createLazyFileRoute('/_auth/mall/collection/create')({
  component: CollectionFormPage,
})
