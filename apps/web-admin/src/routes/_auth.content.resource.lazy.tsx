import { createLazyFileRoute } from '@tanstack/react-router'
import ResourceList from '@/features/resource/resource-list'

export const Route = createLazyFileRoute('/_auth/content/resource')({
  component: ResourceList,
})
