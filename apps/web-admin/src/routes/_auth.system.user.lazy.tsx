import { createLazyFileRoute } from '@tanstack/react-router'
import UserList from '@/features/user/user-list'

export const Route = createLazyFileRoute('/_auth/system/user')({
  component: UserList,
})
