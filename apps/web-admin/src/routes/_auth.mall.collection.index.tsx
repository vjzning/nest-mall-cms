import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/mall/collection/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/mall/collection/"!</div>
}
