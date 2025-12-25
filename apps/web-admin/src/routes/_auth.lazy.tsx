import { createLazyFileRoute } from '@tanstack/react-router'
import AppLayout from '@/components/layout/app-layout'

export const Route = createLazyFileRoute('/_auth')({
  component: AppLayout,
})
