import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { systemLogApi } from './api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function LogList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [username, setUsername] = useState('');
  const [module, setModule] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['system-logs', page, username, module, status],
    queryFn: () =>
      systemLogApi.findAll({
        page,
        limit,
        username: username || undefined,
        module: module || undefined,
        status: status === 'all' ? undefined : Number(status),
      }),
  });

  const handleSearch = () => {
    setPage(1);
  };

  const handleViewDetail = (log: any) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">操作日志</h2>
      </div>

      <div className="flex flex-wrap gap-4 items-end bg-slate-50 p-4 rounded-lg border">
        <div className="space-y-1">
          <label className="text-sm font-medium">操作人</label>
          <Input
            placeholder="搜索操作人"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-[180px]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">所属模块</label>
          <Input
            placeholder="搜索模块"
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="w-[180px]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">状态码</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="1">成功</SelectItem>
              <SelectItem value="0">失败</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" /> 搜索
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>操作人</TableHead>
              <TableHead>模块</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>方法</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>耗时</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  加载中...
                </TableCell>
              </TableRow>
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="font-medium">{log.username}</div>
                    <div className="text-xs text-muted-foreground">{log.userType}</div>
                  </TableCell>
                  <TableCell>{log.module}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.method}</Badge>
                  </TableCell>
                  <TableCell>{log.ip}</TableCell>
                  <TableCell>{log.duration}ms</TableCell>
                  <TableCell>
                    {log.status === 1 ? (
                      <Badge className="bg-green-500 hover:bg-green-600">成功</Badge>
                    ) : (
                      <Badge variant="destructive">失败</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetail(log)}>
                      <Eye className="h-4 w-4 mr-1" /> 详情
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>日志详情</SheetTitle>
          </SheetHeader>
          {selectedLog && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">操作模块</div>
                  <div className="font-medium">{selectedLog.module} / {selectedLog.action}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">请求地址</div>
                  <div className="font-medium">[{selectedLog.method}] {selectedLog.url}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">操作人员</div>
                  <div className="font-medium">{selectedLog.username} ({selectedLog.userType})</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">操作时间</div>
                  <div className="font-medium">{format(new Date(selectedLog.createdAt), 'yyyy-MM-dd HH:mm:ss')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">IP 地址</div>
                  <div className="font-medium">{selectedLog.ip}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">消耗时间</div>
                  <div className="font-medium">{selectedLog.duration}ms</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">请求参数</div>
                <pre className="p-4 bg-slate-50 rounded-md text-xs overflow-x-auto border">
                  {JSON.stringify(JSON.parse(selectedLog.params || '{}'), null, 2)}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">请求体</div>
                <pre className="p-4 bg-slate-50 rounded-md text-xs overflow-x-auto border">
                  {JSON.stringify(JSON.parse(selectedLog.body || '{}'), null, 2)}
                </pre>
              </div>

              {selectedLog.status === 1 ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">响应结果</div>
                  <pre className="p-4 bg-slate-50 rounded-md text-xs overflow-x-auto border">
                    {selectedLog.response || '无响应结果'}
                  </pre>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground text-red-600 font-medium">异常信息</div>
                  <pre className="p-4 bg-red-50 text-red-700 rounded-md text-xs overflow-x-auto border border-red-100">
                    {selectedLog.errorMsg || '无异常信息'}
                  </pre>
                </div>
              )}

              <div className="space-y-2 pb-6">
                <div className="text-sm text-muted-foreground">浏览器 UA</div>
                <div className="p-3 bg-slate-50 rounded-md text-xs break-all border">
                  {selectedLog.userAgent}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
