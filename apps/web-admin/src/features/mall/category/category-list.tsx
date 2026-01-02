import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mallCategoryApi, type MallCategory } from './api';
import { MallCategoryDialog } from './category-dialog';
import { Button } from '@/components/ui/button';
import { PopoverConfirm } from '@/components/ui/popover-confirm';
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Image as ImageIcon,
    ChevronRight,
    ChevronDown,
    MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function MallCategoryList() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<MallCategory | null>(
        null
    );
    const [parentId, setParentId] = useState<number | undefined>(undefined);
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>(
        {}
    );

    const queryClient = useQueryClient();

    const { data: categories, isLoading } = useQuery({
        queryKey: ['mall-categories'],
        queryFn: mallCategoryApi.findAll,
    });

    const deleteMutation = useMutation({
        mutationFn: mallCategoryApi.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mall-categories'] });
            toast.success('删除成功');
        },
        onError: () => {
            toast.error('删除失败，可能存在子分类或关联商品');
        },
    });

    const toggleExpand = (id: number) => {
        setExpandedRows((prev) => ({
            ...prev,
            [String(id)]: !prev[String(id)],
        }));
    };

    const renderRow = (cat: MallCategory, level: number = 0) => {
        const hasChildren = cat.children && cat.children.length > 0;
        const isExpanded = expandedRows[String(cat.id)];

        return (
            <Fragment key={cat.id}>
                <TableRow>
                    <TableCell>
                        <div
                            className='flex items-center'
                            style={{ paddingLeft: `${level * 24}px` }}
                        >
                            {hasChildren ? (
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='p-0 mr-1 w-6 h-6 hover:bg-transparent'
                                    onClick={() => toggleExpand(cat.id)}
                                >
                                    {isExpanded ? (
                                        <ChevronDown className='w-4 h-4' />
                                    ) : (
                                        <ChevronRight className='w-4 h-4' />
                                    )}
                                </Button>
                            ) : (
                                <div className='inline-block w-7' />
                            )}
                            <div className='flex gap-2 items-center'>
                                <Avatar className='w-8 h-8 rounded-sm'>
                                    <AvatarImage
                                        src={cat.icon}
                                        alt={cat.name}
                                    />
                                    <AvatarFallback className='rounded-sm'>
                                        <ImageIcon className='w-4 h-4 text-muted-foreground' />
                                    </AvatarFallback>
                                </Avatar>
                                <span
                                    className={cn(
                                        level > 0 && 'text-muted-foreground'
                                    )}
                                >
                                    {cat.name}
                                </span>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className='w-[100px]'>{cat.sort}</TableCell>
                    <TableCell className='w-[100px]'>
                        <Badge
                            variant={cat.status === 1 ? 'default' : 'secondary'}
                        >
                            {cat.status === 1 ? '启用' : '禁用'}
                        </Badge>
                    </TableCell>
                    <TableCell className='w-[100px]'>
                        {cat.isRecommend === 1 && (
                            <Badge
                                variant='outline'
                                className='text-orange-500 border-orange-500'
                            >
                                推荐
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell className='text-right w-[100px]'>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='ghost' className='p-0 w-8 h-8'>
                                    <span className='sr-only'>打开菜单</span>
                                    <MoreHorizontal className='w-4 h-4' />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                                <DropdownMenuLabel>操作</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setEditingCategory(null);
                                        setParentId(cat.id);
                                        setDialogOpen(true);
                                    }}
                                >
                                    <Plus className='mr-2 w-4 h-4' />
                                    添加子分类
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setEditingCategory(cat);
                                        setDialogOpen(true);
                                    }}
                                >
                                    <Pencil className='mr-2 w-4 h-4' />
                                    编辑
                                </DropdownMenuItem>
                                <PopoverConfirm
                                    title='确认删除?'
                                    description='这将级联删除所有子分类，请谨慎操作。'
                                    onConfirm={() =>
                                        deleteMutation.mutateAsync(cat.id)
                                    }
                                >
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className='text-destructive'
                                    >
                                        <Trash2 className='mr-2 w-4 h-4' />
                                        删除
                                    </DropdownMenuItem>
                                </PopoverConfirm>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
                {isExpanded &&
                    hasChildren &&
                    cat.children!.map((child) => renderRow(child, level + 1))}
            </Fragment>
        );
    };

    if (isLoading) {
        return (
            <div className='flex justify-center p-8'>
                <Loader2 className='animate-spin' />
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-4 p-4 h-full'>
            <div className='flex justify-between items-center'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>
                        商品分类管理
                    </h2>
                    <p className='text-muted-foreground'>
                        管理商城的商品分类层级结构
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setEditingCategory(null);
                        setParentId(undefined);
                        setDialogOpen(true);
                    }}
                >
                    <Plus className='mr-2 w-4 h-4' /> 新增分类
                </Button>
            </div>

            <div className='rounded-md border bg-card'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>分类名称</TableHead>
                            <TableHead>排序</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>推荐</TableHead>
                            <TableHead className='text-right'>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories && categories.length > 0 ? (
                            categories.map((cat) => renderRow(cat))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className='h-24 text-center'
                                >
                                    暂无数据
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <MallCategoryDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                category={editingCategory}
                parentId={parentId}
            />
        </div>
    );
}
