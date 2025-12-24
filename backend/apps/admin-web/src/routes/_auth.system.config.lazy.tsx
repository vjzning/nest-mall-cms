import { createLazyFileRoute } from '@tanstack/react-router'
import SystemConfigList from '@/features/system-config/system-config-list'

export const Route = createLazyFileRoute('/_auth/system/config')({
  component: SystemConfigList,
})
