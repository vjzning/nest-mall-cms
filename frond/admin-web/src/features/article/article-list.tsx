import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articleApi, type Article } from './api';
import { ArticleDialog } from './article-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PopoverConfirm } from '@/components/ui/popover-confirm';
import { Plus, Pencil, Trash2, Search, Loader2, Eye, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function ArticleList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['articles', page, search, statusFilter],
    queryFn: () =>
      articleApi.findAll({
        page,
        limit: 10,
        title: search,
        status: statusFilter === 'all' ? undefined : Number(statusFilter),
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: articleApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Article deleted');
    },
  });

  const renderPaginationItems = () => {
    if (!data) return null;
    const totalPages = data.totalPages;
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink
            href="#"
            onClick={e => {
              e.preventDefault();
              setPage(1);
            }}
            isActive={page === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      items.push(
        <PaginationItem key={p}>
          <PaginationLink
            href="#"
            onClick={e => {
              e.preventDefault();
              setPage(p);
            }}
            isActive={page === p}
          >
            {p}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={e => {
              e.preventDefault();
              setPage(totalPages);
            }}
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Article Management</h2>
          <p className="text-muted-foreground">Manage blog posts and content</p>
        </div>
        <Button
          onClick={() => {
            setEditingArticle(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 w-4 h-4" /> Add Article
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            className="pl-8"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="0">Draft</SelectItem>
            <SelectItem value="1">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items.map(article => (
              <TableRow key={article.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium truncate" title={article.title}>
                      {article.title}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {article.isTop && (
                        <Badge variant="secondary" className="text-[10px] h-4">
                          Top
                        </Badge>
                      )}
                      {article.isRecommend && (
                        <Badge variant="secondary" className="text-[10px] h-4">
                          Rec
                        </Badge>
                      )}
                      {article.tags?.map(t => (
                        <Badge key={t.id} variant="outline" className="text-[10px] h-4">
                          {t.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{article.category?.name || '-'}</TableCell>
                <TableCell>
                  <Badge variant={article.status === 1 ? 'default' : 'secondary'}>
                    {article.status === 1 ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <div className="flex gap-3 items-center">
                    <span className="flex gap-1 items-center">
                      <Eye className="w-3 h-3" /> {article.views}
                    </span>
                    <span className="flex gap-1 items-center">
                      <ThumbsUp className="w-3 h-3" /> {article.likes}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(article.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => {
                        setEditingArticle(article);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <PopoverConfirm
                      title="Delete Article?"
                      description="This action cannot be undone."
                      onConfirm={() => deleteMutation.mutateAsync(article.id)}
                    >
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </PopoverConfirm>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No articles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (page > 1) setPage(p => p - 1);
                }}
                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {renderPaginationItems()}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (page < data.totalPages) setPage(p => p + 1);
                }}
                className={
                  page === data.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <ArticleDialog open={dialogOpen} onOpenChange={setDialogOpen} article={editingArticle} />
    </div>
  );
}
