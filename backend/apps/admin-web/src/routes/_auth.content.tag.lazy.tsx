import { createLazyFileRoute } from '@tanstack/react-router'
import TagList from '@/features/tag/tag-list'

export const Route = createLazyFileRoute('/_auth/content/tag')({
  component: TagList,
})
