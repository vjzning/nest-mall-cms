import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceApi, type ResourceFolder } from '@/features/resource/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Loader2,
    Search,
    UploadCloud,
    Check,
    Image as ImageIcon,
    Folder,
    ChevronRight,
    ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

interface ImagePickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (url: string) => void;
    multiple?: boolean;
}

export function ImagePickerDialog({
    open,
    onOpenChange,
    onSelect,
}: ImagePickerProps) {
    const [activeTab, setActiveTab] = useState('library');
    const [search, setSearch] = useState('');
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
    const [currentFolderId, setCurrentFolderId] = useState<number | undefined>(
        undefined
    );
    const [folderPath, setFolderPath] = useState<ResourceFolder[]>([]);

    const queryClient = useQueryClient();

    // Resource Library
    const { data: resourceData, isLoading: isLoadingResources } = useQuery({
        queryKey: ['resources', currentFolderId, search],
        queryFn: () =>
            resourceApi.findAll({
                folderId: currentFolderId,
                filename: search,
                limit: 100,
            }),
        enabled: open && activeTab === 'library',
    });

    // Folders
    const { data: folderData, isLoading: isLoadingFolders } = useQuery({
        queryKey: ['resource-folders', currentFolderId],
        queryFn: () => resourceApi.findAllFolders(currentFolderId),
        enabled: open && activeTab === 'library' && !search,
    });

    const isLoading = isLoadingResources || isLoadingFolders;

    // Upload Logic
    const uploadMutation = useMutation({
        mutationFn: (file: File) => resourceApi.upload(file, currentFolderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
            toast.success('图片上传成功');
            setActiveTab('library');
        },
        onError: () => {
            toast.error('上传失败');
        },
    });

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': [] },
        multiple: false,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                uploadMutation.mutate(acceptedFiles[0]);
            }
        },
    });

    const handleConfirm = () => {
        if (selectedUrl) {
            onSelect(selectedUrl);
            onOpenChange(false);
            setSelectedUrl(null);
        }
    };

    const handleFolderClick = (folder: ResourceFolder) => {
        setCurrentFolderId(folder.id);
        setFolderPath([...folderPath, folder]);
    };

    const handleBreadcrumbClick = (folder?: ResourceFolder) => {
        if (!folder) {
            setCurrentFolderId(undefined);
            setFolderPath([]);
        } else {
            const index = folderPath.findIndex((f) => f.id === folder.id);
            setCurrentFolderId(folder.id);
            setFolderPath(folderPath.slice(0, index + 1));
        }
    };

    const handleBack = () => {
        if (folderPath.length === 0) return;
        const newPath = [...folderPath];
        newPath.pop();
        setFolderPath(newPath);
        setCurrentFolderId(
            newPath.length > 0 ? newPath[newPath.length - 1].id : undefined
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[850px] h-[650px] flex flex-col p-0 gap-0'>
                <DialogHeader className='p-6 pb-2'>
                    <DialogTitle>选择图片</DialogTitle>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className='flex overflow-hidden flex-col flex-1'
                >
                    <div className='flex justify-between items-center px-6 border-b'>
                        <TabsList className='justify-start p-0 h-12 bg-transparent rounded-none border-b-0'>
                            <TabsTrigger
                                value='library'
                                className='h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent'
                            >
                                素材库
                            </TabsTrigger>
                            <TabsTrigger
                                value='upload'
                                className='h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent'
                            >
                                上传图片
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent
                        value='library'
                        className='overflow-hidden p-0 m-0 h-full'
                    >
                        <div className='flex flex-col h-full'>
                            <div className='flex gap-4 items-center p-4 border-b'>
                                <div className='flex flex-1 gap-2 items-center min-w-0'>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='shrink-0'
                                        disabled={folderPath.length === 0}
                                        onClick={handleBack}
                                    >
                                        <ArrowLeft className='w-4 h-4' />
                                    </Button>
                                    <div className='flex overflow-hidden items-center text-sm whitespace-nowrap'>
                                        <button
                                            onClick={() =>
                                                handleBreadcrumbClick()
                                            }
                                            className={cn(
                                                'hover:text-primary transition-colors',
                                                folderPath.length === 0
                                                    ? 'font-semibold text-foreground'
                                                    : 'text-muted-foreground'
                                            )}
                                        >
                                            全部资源
                                        </button>
                                        {folderPath.map((folder, index) => (
                                            <div
                                                key={folder.id}
                                                className='flex items-center'
                                            >
                                                <ChevronRight className='mx-1 w-4 h-4 text-muted-foreground shrink-0' />
                                                <button
                                                    onClick={() =>
                                                        handleBreadcrumbClick(
                                                            folder
                                                        )
                                                    }
                                                    className={cn(
                                                        'hover:text-primary transition-colors truncate max-w-[100px]',
                                                        index ===
                                                            folderPath.length -
                                                                1
                                                            ? 'font-semibold text-foreground'
                                                            : 'text-muted-foreground'
                                                    )}
                                                >
                                                    {folder.name}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className='relative w-64 shrink-0'>
                                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                                    <Input
                                        placeholder='搜索图片...'
                                        className='pl-8 h-9'
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <ScrollArea className='flex-1 p-4'>
                                {isLoading ? (
                                    <div className='flex justify-center items-center h-40'>
                                        <Loader2 className='w-8 h-8 animate-spin text-muted-foreground' />
                                    </div>
                                ) : (
                                    <div className='grid grid-cols-4 gap-4 sm:grid-cols-5'>
                                        {/* Folders */}
                                        {!search &&
                                            folderData?.map((folder) => (
                                                <div
                                                    key={`folder-${folder.id}`}
                                                    className='flex flex-col gap-2 items-center p-2 rounded-md border transition-colors cursor-pointer group hover:bg-muted/50'
                                                    onClick={() =>
                                                        handleFolderClick(
                                                            folder
                                                        )
                                                    }
                                                >
                                                    <div className='flex justify-center items-center w-full aspect-square text-primary/60 group-hover:text-primary transition-colors'>
                                                        <Folder className='w-12 h-12 fill-current' />
                                                    </div>
                                                    <span className='w-full text-xs text-center truncate px-1'>
                                                        {folder.name}
                                                    </span>
                                                </div>
                                            ))}

                                        {/* Images */}
                                        {resourceData?.items
                                            .filter((item) =>
                                                item.mimeType.startsWith(
                                                    'image/'
                                                )
                                            )
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    className={cn(
                                                        'relative group aspect-square rounded-md border overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50',
                                                        selectedUrl ===
                                                            item.url &&
                                                            'ring-2 ring-primary'
                                                    )}
                                                    onClick={() =>
                                                        setSelectedUrl(item.url)
                                                    }
                                                >
                                                    <img
                                                        src={item.url}
                                                        alt={item.originalName}
                                                        className='object-cover w-full h-full'
                                                    />
                                                    {selectedUrl ===
                                                        item.url && (
                                                        <div className='flex absolute inset-0 justify-center items-center bg-primary/20'>
                                                            <div className='p-1 rounded-full bg-primary text-primary-foreground'>
                                                                <Check className='w-4 h-4' />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className='absolute right-0 bottom-0 left-0 p-1 text-[10px] text-white truncate opacity-0 transition-opacity bg-black/60 group-hover:opacity-100'>
                                                        {item.originalName}
                                                    </div>
                                                </div>
                                            ))}

                                        {(!resourceData?.items ||
                                            resourceData.items.length === 0) &&
                                            (!folderData ||
                                                folderData.length === 0) && (
                                                <div className='flex col-span-full flex-col justify-center items-center py-20 text-muted-foreground'>
                                                    <ImageIcon className='mb-2 w-10 h-10 opacity-20' />
                                                    <p>暂无内容</p>
                                                </div>
                                            )}
                                    </div>
                                )}
                            </ScrollArea>

                            <div className='flex gap-2 justify-end p-4 border-t bg-muted/20'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => onOpenChange(false)}
                                >
                                    取消
                                </Button>
                                <Button
                                    size='sm'
                                    onClick={handleConfirm}
                                    disabled={!selectedUrl}
                                >
                                    确认选择
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value='upload' className='flex-1 p-0 m-0'>
                        <div className='flex flex-col h-full'>
                            <div className='p-4 bg-muted/30 text-xs text-muted-foreground border-b'>
                                当前上传目录：
                                {folderPath.length > 0
                                    ? folderPath.map((f) => f.name).join(' / ')
                                    : '根目录'}
                            </div>
                            <div
                                {...getRootProps()}
                                className={cn(
                                    'flex flex-col justify-center items-center flex-1 m-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer',
                                    isDragActive
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted-foreground/25 hover:border-primary/50'
                                )}
                            >
                                <input {...getInputProps()} />
                                {uploadMutation.isPending ? (
                                    <div className='text-center'>
                                        <Loader2 className='mx-auto mb-4 w-10 h-10 animate-spin text-primary' />
                                        <p>正在上传...</p>
                                    </div>
                                ) : (
                                    <div className='text-center'>
                                        <UploadCloud className='mx-auto mb-4 w-10 h-10 text-muted-foreground' />
                                        <p className='text-lg font-medium'>
                                            拖拽图片到此处
                                        </p>
                                        <p className='mt-1 text-sm text-muted-foreground'>
                                            或点击浏览文件
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
