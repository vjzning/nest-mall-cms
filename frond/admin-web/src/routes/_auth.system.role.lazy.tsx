import { createLazyFileRoute } from '@tanstack/react-router'
import RoleList from '@/features/role/role-list'

export const Route = createLazyFileRoute('/_auth/system/role')({
  component: RoleList,
})
