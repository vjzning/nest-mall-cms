import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Search, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { getProducts } from '@/features/mall/product/api';
import { categoryApi } from '@/features/category/api';
import { articleApi } from '@/features/article/api';

export type ContentType = 'product' | 'category' | 'article';

interface ContentPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ContentType;
  selectionMode?: 'single' | 'multiple';
  onSelect: (selected: any[]) => void;
  title?: string;
}

export function ContentPicker({
  open,
  onOpenChange,
  type,
  selectionMode = 'single',
  onSelect,
  title,
}: ContentPickerProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Fetch logic based on type
  const { data, isLoading } = useQuery({
    queryKey: ['content-picker', type, page, search],
    queryFn: async () => {
      if (type === 'product') {
        const res = await getProducts({ page, limit: pageSize, name: search });
        return { items: res.items, total: res.total, totalPages: res.totalPages };
      } else if (type === 'article') {
        const res = await articleApi.findAll({ page, limit: pageSize, title: search });
        return { items: res.items, total: res.total, totalPages: res.totalPages };
      } else {
        // Categories are usually flat or limited, but we fetch all and filter client side for simplicity if no server pagination
        const res = await categoryApi.findAll();
        const filtered = search
          ? res.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
          : res;
        return {
          items: filtered.slice((page - 1) * pageSize, page * pageSize),
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / pageSize)
        };
      }
    },
    enabled: open,
  });

  const items = data?.items || [];
  const totalPages = data?.totalPages || 0;

  const handleToggleSelect = (item: any) => {
    if (selectionMode === 'single') {
      setSelectedIds([item.id]);
    } else {
      setSelectedIds(prev =>
        prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
      );
    }
  };

  const handleConfirm = () => {
    const selectedItems = items.filter(item => selectedIds.includes(item.id));
    onSelect(selectedItems);
    onOpenChange(false);
  };

  const getDisplayName = (item: any) => {
    if (type === 'product') return item.name;
    if (type === 'article') return item.title;
    return item.name;
  };

  const getDisplayCover = (item: any) => {
    return item.cover || item.coverImage;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title || `Select ${type.charAt(0).toUpperCase() + type.slice(1)}`}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 my-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${type}...`}
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto border rounded-md">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="w-[60px]">Cover</TableHead>
                  <TableHead>Title/Name</TableHead>
                  <TableHead>Extra Info</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: any) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => handleToggleSelect(item)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {selectionMode === 'multiple' ? (
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={() => handleToggleSelect(item)}
                        />
                      ) : (
                        <RadioGroup value={selectedIds[0]?.toString()}>
                          <RadioGroupItem
                            value={item.id.toString()}
                            checked={selectedIds.includes(item.id)}
                            onClick={() => handleToggleSelect(item)}
                          />
                        </RadioGroup>
                      )}
                    </TableCell>
                    <TableCell>
                      {getDisplayCover(item) ? (
                        <img src={getDisplayCover(item)} className="w-8 h-8 object-cover rounded" />
                      ) : (
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getDisplayName(item)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      ID: {item.id} {type === 'product' && `| Price: ¥${item.price}`}
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No {type}s found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Selected: {selectedIds.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">Page {page} of {totalPages || 1}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={selectedIds.length === 0}>Confirm Selection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
