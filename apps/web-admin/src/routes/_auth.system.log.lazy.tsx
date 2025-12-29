import { createLazyFileRoute } from '@tanstack/react-router'
import LogList from '@/features/system-log/log-list'

export const Route = createLazyFileRoute('/_auth/system/log')({
  component: LogList,
})
