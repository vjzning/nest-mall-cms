import { createLazyFileRoute } from '@tanstack/react-router'
import MenuList from '@/features/menu/menu-list'

export const Route = createLazyFileRoute('/_auth/system/menu')({
  component: MenuList,
})
