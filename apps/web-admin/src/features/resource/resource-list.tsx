import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceApi, type ResourceFolder } from './api';
import { UploadDialog } from './upload-dialog';
import { StorageSettingsDialog } from './storage-settings-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PopoverConfirm } from '@/components/ui/popover-confirm';
import {
    Loader2,
    Upload,
    Search,
    Trash2,
    Copy,
    File,
    ExternalLink,
    Settings,
    Folder,
    Plus,
    ChevronRight,
    ArrowLeft,
    MoreVertical,
    Edit2,
    Move,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ResourceList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState<number | undefined>(undefined);
    const [folderPath, setFolderPath] = useState<ResourceFolder[]>([]);
    
    const queryClient = useQueryClient();

    // Resources Query
    const { data, isLoading: isLoadingResources } = useQuery({
        queryKey: ['resources', currentFolderId, page, search],
        queryFn: () =>
            resourceApi.findAll({ folderId: currentFolderId, page, limit: 20, filename: search }),
    });

    // Folders Query
    const { data: folderData, isLoading: isLoadingFolders } = useQuery({
        queryKey: ['resource-folders', currentFolderId],
        queryFn: () => resourceApi.findAllFolders(currentFolderId),
        enabled: !search,
    });

    const isLoading = isLoadingResources || isLoadingFolders;

    const deleteMutation = useMutation({
        mutationFn: resourceApi.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
            toast.success('资源已删除');
        },
    });

    const createFolderMutation = useMutation({
        mutationFn: (name: string) => resourceApi.createFolder(name, currentFolderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-folders'] });
            toast.success('目录已创建');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || '创建目录失败');
        },
    });

    const deleteFolderMutation = useMutation({
        mutationFn: resourceApi.removeFolder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-folders'] });
            toast.success('目录已删除');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || '删除目录失败');
        },
    });

    const moveResourceMutation = useMutation({
        mutationFn: ({ id, folderId }: { id: number; folderId?: number }) => 
            resourceApi.moveResource(id, folderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
            toast.success('资源已移动');
        },
    });

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('链接已复制到剪贴板');
    };

    const isImage = (mimeType: string) => mimeType.startsWith('image/');

    const handleFolderClick = (folder: ResourceFolder) => {
        setCurrentFolderId(folder.id);
        setFolderPath([...folderPath, folder]);
        setPage(1);
    };

    const handleBreadcrumbClick = (folder?: ResourceFolder) => {
        if (!folder) {
            setCurrentFolderId(undefined);
            setFolderPath([]);
        } else {
            const index = folderPath.findIndex(f => f.id === folder.id);
            setCurrentFolderId(folder.id);
            setFolderPath(folderPath.slice(0, index + 1));
        }
        setPage(1);
    };

    const handleBack = () => {
        if (folderPath.length === 0) return;
        const newPath = [...folderPath];
        newPath.pop();
        setFolderPath(newPath);
        setCurrentFolderId(newPath.length > 0 ? newPath[newPath.length - 1].id : undefined);
        setPage(1);
    };

    const handleCreateFolder = () => {
        const name = window.prompt('请输入目录名称');
        if (name) {
            createFolderMutation.mutate(name);
        }
    };

    if (isLoading && page === 1) {
        return (
            <div className='flex justify-center p-8'>
                <Loader2 className='animate-spin' />
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-6 h-full'>
            <div className='flex justify-between items-center'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>
                        资源管理
                    </h2>
                    <p className='text-muted-foreground'>
                        管理上传的文件和图片
                    </p>
                </div>
                <div className='flex gap-2'>
                    <Button
                        variant='outline'
                        onClick={() => setSettingsOpen(true)}
                    >
                        <Settings className='mr-2 w-4 h-4' /> 设置
                    </Button>
                    <Button variant='outline' onClick={handleCreateFolder}>
                        <Plus className='mr-2 w-4 h-4' /> 新建文件夹
                    </Button>
                    <Button onClick={() => setUploadOpen(true)}>
                        <Upload className='mr-2 w-4 h-4' /> 上传
                    </Button>
                </div>
            </div>

            <div className='flex flex-wrap gap-4 items-center justify-between'>
                <div className='flex items-center gap-2 min-w-0'>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={folderPath.length === 0}
                        onClick={handleBack}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className='flex items-center text-sm font-medium'>
                        <button 
                            onClick={() => handleBreadcrumbClick()}
                            className={cn(
                                "hover:text-primary transition-colors",
                                folderPath.length === 0 ? "text-foreground" : "text-muted-foreground"
                            )}
                        >
                            全部资源
                        </button>
                        {folderPath.map((folder, index) => (
                            <div key={folder.id} className='flex items-center'>
                                <ChevronRight className='mx-1 w-4 h-4 text-muted-foreground' />
                                <button 
                                    onClick={() => handleBreadcrumbClick(folder)}
                                    className={cn(
                                        "hover:text-primary transition-colors truncate max-w-[150px]",
                                        index === folderPath.length - 1 ? "text-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    {folder.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='relative w-full max-w-sm'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                        type='search'
                        placeholder='搜索文件...'
                        className='pl-8'
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
                {/* Folders */}
                {!search && folderData?.map((folder) => (
                    <div
                        key={`folder-${folder.id}`}
                        className='overflow-hidden relative rounded-lg border transition-all group bg-card hover:shadow-md hover:border-primary/50'
                    >
                        <div 
                            className='flex relative justify-center items-center aspect-square bg-muted/20 cursor-pointer'
                            onClick={() => handleFolderClick(folder)}
                        >
                            <Folder className='w-16 h-16 text-primary/40 fill-current group-hover:text-primary/60 transition-colors' />
                            
                            <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant='ghost' size='icon' className='w-8 h-8 h-8 w-8 p-0'>
                                            <MoreVertical className='h-4 w-4' />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='end'>
                                        <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation();
                                            const name = window.prompt('请输入新名称', folder.name);
                                            if (name && name !== folder.name) {
                                                resourceApi.updateFolder(folder.id, name).then(() => {
                                                    queryClient.invalidateQueries({ queryKey: ['resource-folders'] });
                                                    toast.success('目录已重命名');
                                                });
                                            }
                                        }}>
                                            <Edit2 className='mr-2 h-4 w-4' /> 重命名
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className='text-destructive focus:text-destructive'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm('确认删除该目录？')) {
                                                    deleteFolderMutation.mutate(folder.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className='mr-2 h-4 w-4' /> 删除
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className='p-3 border-t'>
                            <p className='text-sm font-medium truncate text-center' title={folder.name}>
                                {folder.name}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Files */}
                {data?.items.map((item) => (
                    <div
                        key={item.id}
                        className='overflow-hidden relative rounded-lg border transition-shadow group bg-card hover:shadow-md'
                    >
                        <div className='flex overflow-hidden relative justify-center items-center aspect-square bg-muted/30'>
                            {isImage(item.mimeType) ? (
                                <img
                                    src={item.url}
                                    alt={item.originalName}
                                    className='object-cover w-full h-full transition-transform group-hover:scale-105'
                                    loading='lazy'
                                />
                            ) : (
                                <File className='w-12 h-12 text-muted-foreground' />
                            )}

                            {/* Driver Badge */}
                            <div className='absolute top-2 right-2 opacity-100 transition-opacity group-hover:opacity-0'>
                                <Badge
                                    variant='secondary'
                                    className='text-[10px] h-5 px-1.5 bg-black/50 text-white backdrop-blur-sm border-0'
                                >
                                    {item.driver === 'aliyun-oss'
                                        ? 'OSS'
                                        : item.driver === 'aws-s3'
                                          ? 'S3'
                                          : 'Local'}
                                </Badge>
                            </div>

                            {/* Overlay Actions */}
                            <div className='flex absolute inset-0 gap-2 justify-center items-center opacity-0 transition-opacity bg-black/40 group-hover:opacity-100'>
                                <Button
                                    size='icon'
                                    variant='secondary'
                                    className='w-8 h-8 rounded-full'
                                    onClick={() =>
                                        window.open(item.url, '_blank')
                                    }
                                >
                                    <ExternalLink className='w-4 h-4' />
                                </Button>
                                <Button
                                    size='icon'
                                    variant='secondary'
                                    className='w-8 h-8 rounded-full'
                                    onClick={() => handleCopyUrl(item.url)}
                                >
                                    <Copy className='w-4 h-4' />
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            size='icon'
                                            variant='secondary'
                                            className='w-8 h-8 rounded-full'
                                        >
                                            <Move className='w-4 h-4' />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='center'>
                                        <DropdownMenuItem onClick={() => moveResourceMutation.mutate({ id: item.id, folderId: undefined })}>
                                            移动到根目录
                                        </DropdownMenuItem>
                                        {folderPath.length > 1 && (
                                            <DropdownMenuItem onClick={() => moveResourceMutation.mutate({ id: item.id, folderId: folderPath[folderPath.length - 2].id })}>
                                                移动到上一级
                                            </DropdownMenuItem>
                                        )}
                                        {folderData?.map(f => (
                                            <DropdownMenuItem key={f.id} onClick={() => moveResourceMutation.mutate({ id: item.id, folderId: f.id })}>
                                                移动到：{f.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <PopoverConfirm
                                    title='确认删除资源？'
                                    description='此操作无法撤销。'
                                    onConfirm={() =>
                                        deleteMutation.mutateAsync(item.id)
                                    }
                                >
                                    <Button
                                        size='icon'
                                        variant='destructive'
                                        className='w-8 h-8 rounded-full'
                                    >
                                        <Trash2 className='w-4 h-4' />
                                    </Button>
                                </PopoverConfirm>
                            </div>
                        </div>

                        <div className='p-3'>
                            <div className='flex gap-2 justify-between items-start'>
                                <div className='min-w-0'>
                                    <p
                                        className='text-sm font-medium truncate'
                                        title={item.originalName}
                                    >
                                        {item.originalName}
                                    </p>
                                    <p className='text-xs truncate text-muted-foreground'>
                                        {(item.size / 1024).toFixed(1)} KB •{' '}
                                        {new Date(
                                            item.created_at
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {(!data || data.items.length === 0) && (!folderData || folderData.length === 0) && (
                <div className='flex flex-col justify-center items-center py-20 text-muted-foreground'>
                    <File className='mb-4 w-12 h-12 opacity-20' />
                    <p>暂无资源</p>
                </div>
            )}

            {/* Pagination (Simple) */}
            {data && data.totalPages > 1 && (
                <div className='flex gap-2 justify-center mt-4'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        上一页
                    </Button>
                    <span className='flex items-center text-sm'>
                        第 {page} 页，共 {data.totalPages} 页
                    </span>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                            setPage((p) => Math.min(data.totalPages, p + 1))
                        }
                        disabled={page === data.totalPages}
                    >
                        下一页
                    </Button>
                </div>
            )}

            <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} folderId={currentFolderId} />
            <StorageSettingsDialog
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
            />
        </div>
    );
}
