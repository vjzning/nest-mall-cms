import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceApi } from './api';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function ResourceList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['resources', page, search],
        queryFn: () =>
            resourceApi.findAll({ page, limit: 20, filename: search }),
    });

    const deleteMutation = useMutation({
        mutationFn: resourceApi.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
            toast.success('资源已删除');
        },
    });

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('链接已复制到剪贴板');
    };

    const isImage = (mimeType: string) => mimeType.startsWith('image/');

    if (isLoading) {
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
                    <Button onClick={() => setUploadOpen(true)}>
                        <Upload className='mr-2 w-4 h-4' /> 上传
                    </Button>
                </div>
            </div>

            <div className='flex gap-2 items-center'>
                <div className='relative flex-1 max-w-sm'>
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

            <div className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5'>
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

            {data?.items.length === 0 && (
                <div className='flex flex-col justify-center items-center py-12 text-muted-foreground'>
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

            <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
            <StorageSettingsDialog
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
            />
        </div>
    );
}
