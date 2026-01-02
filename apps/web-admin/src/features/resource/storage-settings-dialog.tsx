import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemConfigApi } from '../system-config/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface StorageSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const STORAGE_KEYS = {
    ACTIVE_DRIVER: 'storage.active_driver',
    OSS_REGION: 'storage.oss.region',
    OSS_ACCESS_KEY_ID: 'storage.oss.accessKeyId',
    OSS_ACCESS_KEY_SECRET: 'storage.oss.accessKeySecret',
    OSS_BUCKET: 'storage.oss.bucket',
    OSS_ENDPOINT: 'storage.oss.endpoint',
    S3_REGION: 'storage.s3.region',
    S3_ACCESS_KEY_ID: 'storage.s3.accessKeyId',
    S3_SECRET_ACCESS_KEY: 'storage.s3.secretAccessKey',
    S3_BUCKET: 'storage.s3.bucket',
    S3_ENDPOINT: 'storage.s3.endpoint',
};

export function StorageSettingsDialog({
    open,
    onOpenChange,
}: StorageSettingsDialogProps) {
    const [activeDriver, setActiveDriver] = useState<string>('local');
    const [ossConfig, setOssConfig] = useState<any>({});
    const [s3Config, setS3Config] = useState<any>({});
    const queryClient = useQueryClient();

    const { data: configs, isLoading } = useQuery({
        queryKey: ['system-configs'],
        queryFn: systemConfigApi.findAll,
        enabled: open,
    });

    useEffect(() => {
        if (configs) {
            const getVal = (key: string) =>
                configs.find((c) => c.key === key)?.value || '';

            setActiveDriver(getVal(STORAGE_KEYS.ACTIVE_DRIVER) || 'local');

            setOssConfig({
                region: getVal(STORAGE_KEYS.OSS_REGION),
                accessKeyId: getVal(STORAGE_KEYS.OSS_ACCESS_KEY_ID),
                accessKeySecret: getVal(STORAGE_KEYS.OSS_ACCESS_KEY_SECRET), // Masked
                bucket: getVal(STORAGE_KEYS.OSS_BUCKET),
                endpoint: getVal(STORAGE_KEYS.OSS_ENDPOINT),
            });

            setS3Config({
                region: getVal(STORAGE_KEYS.S3_REGION),
                accessKeyId: getVal(STORAGE_KEYS.S3_ACCESS_KEY_ID),
                secretAccessKey: getVal(STORAGE_KEYS.S3_SECRET_ACCESS_KEY), // Masked
                bucket: getVal(STORAGE_KEYS.S3_BUCKET),
                endpoint: getVal(STORAGE_KEYS.S3_ENDPOINT),
            });
        }
    }, [configs, open]);

    const updateMutation = useMutation({
        mutationFn: async (data: {
            key: string;
            value: string;
            group: string;
            isEncrypted: boolean;
        }) => {
            // Find existing config to update or create new
            const existing = configs?.find((c) => c.key === data.key);
            if (existing) {
                return systemConfigApi.update(existing.id, data);
            } else {
                return systemConfigApi.create(data);
            }
        },
    });

    const handleSave = async () => {
        try {
            // Save Active Driver
            await updateMutation.mutateAsync({
                key: STORAGE_KEYS.ACTIVE_DRIVER,
                value: activeDriver,
                group: 'storage',
                isEncrypted: false,
            });

            // Save OSS Config
            if (activeDriver === 'aliyun-oss' || ossConfig.accessKeyId) {
                const ossUpdates = [
                    {
                        key: STORAGE_KEYS.OSS_REGION,
                        value: ossConfig.region,
                        isEncrypted: false,
                    },
                    {
                        key: STORAGE_KEYS.OSS_ACCESS_KEY_ID,
                        value: ossConfig.accessKeyId,
                        isEncrypted: false,
                    },
                    {
                        key: STORAGE_KEYS.OSS_ACCESS_KEY_SECRET,
                        value: ossConfig.accessKeySecret,
                        isEncrypted: true,
                    },
                    {
                        key: STORAGE_KEYS.OSS_BUCKET,
                        value: ossConfig.bucket,
                        isEncrypted: false,
                    },
                    {
                        key: STORAGE_KEYS.OSS_ENDPOINT,
                        value: ossConfig.endpoint,
                        isEncrypted: false,
                    },
                ];
                for (const item of ossUpdates) {
                    if (item.value) {
                        // Only save if value is present (or mask if not changed)
                        await updateMutation.mutateAsync({
                            ...item,
                            group: 'storage',
                        });
                    }
                }
            }

            // Save S3 Config
            if (activeDriver === 'aws-s3' || s3Config.accessKeyId) {
                const s3Updates = [
                    {
                        key: STORAGE_KEYS.S3_REGION,
                        value: s3Config.region,
                        isEncrypted: false,
                    },
                    {
                        key: STORAGE_KEYS.S3_ACCESS_KEY_ID,
                        value: s3Config.accessKeyId,
                        isEncrypted: false,
                    },
                    {
                        key: STORAGE_KEYS.S3_SECRET_ACCESS_KEY,
                        value: s3Config.secretAccessKey,
                        isEncrypted: true,
                    },
                    {
                        key: STORAGE_KEYS.S3_BUCKET,
                        value: s3Config.bucket,
                        isEncrypted: false,
                    },
                    {
                        key: STORAGE_KEYS.S3_ENDPOINT,
                        value: s3Config.endpoint,
                        isEncrypted: false,
                    },
                ];
                for (const item of s3Updates) {
                    if (item.value) {
                        await updateMutation.mutateAsync({
                            ...item,
                            group: 'storage',
                        });
                    }
                }
            }

            await systemConfigApi.refreshCache();
            queryClient.invalidateQueries({ queryKey: ['system-configs'] });
            toast.success('存储设置已保存');
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error('保存设置失败');
        }
    };

    if (isLoading) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[600px] max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>存储设置</DialogTitle>
                </DialogHeader>

                <div className='grid gap-4 py-4'>
                    <div className='grid grid-cols-4 gap-4 items-center'>
                        <Label htmlFor='driver' className='text-right'>
                            当前存储驱动
                        </Label>
                        <Select
                            value={activeDriver}
                            onValueChange={setActiveDriver}
                        >
                            <SelectTrigger className='col-span-3'>
                                <SelectValue placeholder='选择驱动' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='local'>
                                    本地存储 (Local)
                                </SelectItem>
                                <SelectItem value='aliyun-oss'>
                                    阿里云 OSS
                                </SelectItem>
                                <SelectItem value='aws-s3'>
                                    AWS S3 / 兼容协议
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Tabs defaultValue='aliyun-oss' className='mt-4 w-full'>
                        <TabsList className='grid grid-cols-2 w-full'>
                            <TabsTrigger value='aliyun-oss'>
                                阿里云 OSS
                            </TabsTrigger>
                            <TabsTrigger value='aws-s3'>AWS S3</TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value='aliyun-oss'
                            className='p-4 mt-2 space-y-4 rounded-md border'
                        >
                            <div className='grid grid-cols-3 gap-4 items-center'>
                                <Label className='text-right'>
                                    Region (区域)
                                </Label>
                                <Input
                                    className='col-span-2'
                                    value={ossConfig.region}
                                    onChange={(e) =>
                                        setOssConfig({
                                            ...ossConfig,
                                            region: e.target.value,
                                        })
                                    }
                                    placeholder='oss-cn-hangzhou'
                                />
                            </div>
                            <div className='grid grid-cols-3 gap-4 items-center'>
                                <Label className='text-right'>
                                    AccessKey ID
                                </Label>
                                <Input
                                    className='col-span-2'
                                    value={ossConfig.accessKeyId}
                                    onChange={(e) =>
                                        setOssConfig({
                                            ...ossConfig,
                                            accessKeyId: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className='grid grid-cols-3 gap-4 items-center'>
                                <Label className='text-right'>
                                    AccessKey Secret
                                </Label>
                                <Input
                                    className='col-span-2'
                                    type='password'
                                    value={ossConfig.accessKeySecret}
                                    onChange={(e) =>
                                        setOssConfig({
                                            ...ossConfig,
                                            accessKeySecret: e.target.value,
                                        })
                                    }
                                    placeholder={
                                        ossConfig.accessKeySecret === '******'
                                            ? '******'
                                            : ''
                                    }
                                />
                            </div>
                            <div className='grid grid-cols-3 gap-4 items-center'>
                                <Label className='text-right'>
                                    Bucket (空间名称)
                                </Label>
                                <Input
                                    className='col-span-2'
                                    value={ossConfig.bucket}
                                    onChange={(e) =>
                                        setOssConfig({
                                            ...ossConfig,
                                            bucket: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className='grid grid-cols-3 gap-4 items-center'>
                                <Label className='text-right'>
                                    Endpoint (可选)
                                </Label>
                                <Input
                                    className='col-span-2'
                                    value={ossConfig.endpoint}
                                    onChange={(e) =>
                                        setOssConfig({
                                            ...ossConfig,
                                            endpoint: e.target.value,
                                        })
                                    }
                                    placeholder='自定义域名或内网域名'
                                />
                            </div>
                        </TabsContent>

                        <TabsContent
                            value='aws-s3'
                            className='p-4 mt-2 space-y-4 rounded-md border'
                        >
                            <div className='grid grid-cols-3 gap-4 items-center'>
                                <Label className='text-right'>
                                    Region (区域)
                                </Label>
                                <Input
                                    className='col-span-2'
                                    value={s3Config.region}
                                    onChange={(e) =>
                                        setS3Config({
                                            ...s3Config,
                                            region: e.target.value,
                                        })
                                    }
                                    placeholder='us-east-1'
                                />
                            </div>
                            <div className='grid grid-cols-3 gap-4 items-center'>
                                <Label className='text-right'>
                                    AccessKey ID
                                </Label>
                                <Input
                                    className='col-span-2'
                                    value={s3Config.accessKeyId}
                                    onChange={(e) =>
                                        setS3Config({
                                            ...s3Config,
                                            accessKeyId: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className='grid grid-cols-3 gap-4 items-center'>
                                <Label className='text-right'>
                                    Secret Access Key
                                </Label>
                                <Input
                                    className='col-span-2'
                                    type='password'
                                    value={s3Config.secretAccessKey}
                                    onChange={(e) =>
                                        setS3Config({
                                            ...s3Config,
                                            secretAccessKey: e.target.value,
                                        })
                                    }
                                    placeholder={
                                        s3Config.secretAccessKey === '******'
                                            ? '******'
                                            : ''
                                    }
                                />
                            </div>
                            <div className='grid grid-cols-3 gap-4 items-center'>
                                <Label className='text-right'>
                                    Bucket (空间名称)
                                </Label>
                                <Input
                                    className='col-span-2'
                                    value={s3Config.bucket}
                                    onChange={(e) =>
                                        setS3Config({
                                            ...s3Config,
                                            bucket: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className='grid grid-cols-3 gap-4 items-center'>
                                <Label className='text-right'>
                                    Endpoint (可选)
                                </Label>
                                <Input
                                    className='col-span-2'
                                    value={s3Config.endpoint}
                                    onChange={(e) =>
                                        setS3Config({
                                            ...s3Config,
                                            endpoint: e.target.value,
                                        })
                                    }
                                    placeholder='S3 兼容服务的 Endpoint'
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter>
                    <Button
                        variant='outline'
                        onClick={() => onOpenChange(false)}
                    >
                        取消
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending && (
                            <Loader2 className='mr-2 w-4 h-4 animate-spin' />
                        )}
                        保存设置
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
