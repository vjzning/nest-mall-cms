import { createFileRoute } from '@tanstack/react-router'
import { Forbidden } from '@/components/forbidden'

export const Route = createFileRoute('/403')({
  component: Forbidden,
})
