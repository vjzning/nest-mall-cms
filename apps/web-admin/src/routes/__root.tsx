import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { NotFound } from '@/components/not-found'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
  notFoundComponent: NotFound,
  errorComponent: ({ error, reset }: { error: Error; reset: () => void }) => (
    <div className="flex flex-col items-center justify-center h-screen w-full p-4 text-center">
      <div className="bg-destructive/10 p-4 rounded-full mb-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold mb-2">出错了</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        抱歉，系统在渲染页面时遇到了意料之外的错误。这可能是由于网络问题或程序异常导致的。
      </p>
      {import.meta.env.DEV && (
        <pre className="bg-muted p-4 rounded-md text-left text-xs mb-8 max-w-2xl overflow-auto w-full">
          {error.message}
          {error.stack}
        </pre>
      )}
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          重试
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = '/admin')}>
          返回首页
        </Button>
      </div>
    </div>
  ),
})
