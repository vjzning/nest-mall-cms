import { createLazyFileRoute } from '@tanstack/react-router'
import LoginPage from '@/features/auth/login-page'

export const Route = createLazyFileRoute('/login')({
  component: LoginPage,
})
