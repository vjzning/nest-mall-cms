import { createFileRoute } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth.store';
import { Card } from '@/components/ui/card';
import { useEffect } from 'react';

export const Route = createFileRoute('/_auth/system/queues')({
  component: QueuesPage,
});

function QueuesPage() {
  const { token } = useAuthStore();
  const queueUrl = `/queues`; // 不再需要拼接 query token，改用 cookie

  useEffect(() => {
    if (token) {
      // 将 token 写入 cookie，以便 iframe 内部的静态资源和 API 请求能自动携带
      document.cookie = `admin_token=${token}; path=/; max-age=86400; SameSite=Strict`;
    }
  }, [token]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">任务队列监控</h2>
      </div>
      <Card className="flex-1 overflow-hidden border-none shadow-none">
        <iframe
          src={queueUrl}
          className="w-full h-full border-0"
          title="BullMQ Dashboard"
        />
      </Card>
    </div>
  );
}
