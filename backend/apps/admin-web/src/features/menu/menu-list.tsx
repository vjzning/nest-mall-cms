import { useState, useMemo, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi, type Menu, type CreateMenuDto } from './api';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, Folder, MousePointerClick, MoreHorizontal, Plus, Pencil, Trash, ChevronRight, ChevronDown } from 'lucide-react';
import { MenuDialog } from './menu-dialog';
import { PopoverConfirm } from '@/components/ui/popover-confirm';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MenuWithChildren extends Menu {
  children?: MenuWithChildren[];
}

export default function MenuList() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const { data: menus, isLoading } = useQuery({
    queryKey: ['menus'],
    queryFn: menuApi.findAll,
  });

  const toggleExpand = (id: string | number) => {
    setExpandedRows(prev => ({
      ...prev,
      [String(id)]: !prev[String(id)]
    }));
  };

  const treeData = useMemo(() => {
    if (!menus) return [];
    
    const map = new Map<string, MenuWithChildren>();
    const roots: MenuWithChildren[] = [];

    // First pass: create nodes
    menus.forEach(menu => {
      map.set(String(menu.id), { ...menu, children: [] });
    });

    // Second pass: build hierarchy
    menus.forEach(menu => {
      const node = map.get(String(menu.id))!;
      if (menu.parentId && menu.parentId !== 0 && menu.parentId !== '0') {
        const parent = map.get(String(menu.parentId));
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
          // Sort children by sort order
          parent.children.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        } else {
            // Parent not found, treat as root
            roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    // Sort roots by sort order
    return roots.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }, [menus]);

  const createMutation = useMutation({
    mutationFn: menuApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('Menu created successfully');
      setIsDialogOpen(false);
    },
    onError: () => {
        toast.error('Failed to create menu');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateMenuDto }) =>
      menuApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('Menu updated successfully');
      setIsDialogOpen(false);
      setSelectedMenu(null);
    },
    onError: () => {
        toast.error('Failed to update menu');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: menuApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('Menu deleted successfully');
    },
    onError: () => {
        toast.error('Failed to delete menu');
    }
  });

  const handleCreate = (parentId?: number | string) => {
    setSelectedMenu(parentId ? { parentId } as any : null);
    setIsDialogOpen(true);
  };

  const handleEdit = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleSubmit = async (data: CreateMenuDto) => {
    if (selectedMenu && selectedMenu.id) {
      await updateMutation.mutateAsync({ id: Number(selectedMenu.id), data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const getTypeName = (type: number) => {
    switch (type) {
        case 1: return <Badge variant="outline"><Folder className="mr-1 w-3 h-3"/> Directory</Badge>;
        case 2: return <Badge variant="secondary"><FileText className="mr-1 w-3 h-3"/> Menu</Badge>;
        case 3: return <Badge><MousePointerClick className="mr-1 w-3 h-3"/> Button</Badge>;
        default: return 'Unknown';
    }
  };

  const renderRow = (menu: MenuWithChildren, level: number = 0) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedRows[String(menu.id)];

    return (
      <Fragment key={menu.id}>
        <TableRow>
          <TableCell className="font-medium">
            <div 
                className="flex items-center" 
                style={{ paddingLeft: `${level * 24}px` }}
            >
                {hasChildren ? (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 mr-1 p-0 hover:bg-transparent"
                        onClick={() => toggleExpand(menu.id)}
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                ) : (
                    <div className="w-7 inline-block" /> 
                )}
                <span className={cn(level > 0 && "text-muted-foreground")}>
                    {menu.name}
                </span>
            </div>
          </TableCell>
          <TableCell>{menu.code}</TableCell>
          <TableCell>{getTypeName(menu.type)}</TableCell>
          <TableCell>{menu.path}</TableCell>
          <TableCell>{menu.sort}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 w-8 h-8">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEdit(menu)}>
                  <Pencil className="mr-2 w-4 h-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreate(menu.id)}>
                  <Plus className="mr-2 w-4 h-4" />
                  Add Submenu
                </DropdownMenuItem>
                <PopoverConfirm
                  title="Delete Menu"
                  description="Are you sure you want to delete this menu? This action cannot be undone."
                  onConfirm={() => handleDelete(Number(menu.id))}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                      <Trash className="mr-2 w-4 h-4" />
                      Delete
                  </DropdownMenuItem>
                </PopoverConfirm>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {isExpanded && hasChildren && menu.children!.map(child => renderRow(child, level + 1))}
      </Fragment>
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Menus</h2>
        <Button onClick={() => handleCreate()}>
          <Plus className="mr-2 w-4 h-4" />
          Add Menu
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Path</TableHead>
              <TableHead>Sort</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {treeData.map((menu) => renderRow(menu))}
          </TableBody>
        </Table>
      </div>

      <MenuDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        menu={selectedMenu}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
