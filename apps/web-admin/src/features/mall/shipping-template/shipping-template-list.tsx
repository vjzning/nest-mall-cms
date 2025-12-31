import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getShippingTemplates, deleteShippingTemplate } from './api';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PopoverConfirm } from '@/components/ui/popover-confirm';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

export default function ShippingTemplateList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page] = useState(1);
    const pageSize = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['shipping-templates', page],
        queryFn: () => getShippingTemplates({ page, pageSize }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteShippingTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipping-templates'] });
            toast.success('Template deleted');
        },
    });

    if (isLoading) {
        return (
            <div className='flex justify-center p-8'>
                <Loader2 className='animate-spin' />
            </div>
        );
    }

    const templates = data?.items || [];

    const getChargeTypeText = (type: number) => {
        switch (type) {
            case 1:
                return '按件数';
            case 2:
                return '按重量';
            case 3:
                return '按体积';
            default:
                return '未知';
        }
    };

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex justify-between items-center'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>
                        运费模板
                    </h2>
                    <p className='text-muted-foreground'>
                        管理商品运费规则及地区计费
                    </p>
                </div>
                <Button
                    onClick={() =>
                        navigate({
                            to: '/mall/shipping-template/create' as any,
                        })
                    }
                >
                    <Plus className='mr-2 w-4 h-4' /> 新增模板
                </Button>
            </div>

            <div className='border rounded-md'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>模板名称</TableHead>
                            <TableHead>计费方式</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>默认模板</TableHead>
                            <TableHead>创建时间</TableHead>
                            <TableHead className='text-right'>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className='text-center py-8 text-muted-foreground'
                                >
                                    暂无运费模板
                                </TableCell>
                            </TableRow>
                        ) : (
                            templates.map((template) => (
                                <TableRow key={template.id}>
                                    <TableCell className='font-medium'>
                                        {template.name}
                                    </TableCell>
                                    <TableCell>
                                        {getChargeTypeText(template.chargeType)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                template.status === 1
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {template.status === 1
                                                ? '启用'
                                                : '禁用'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {template.isDefault && (
                                            <Badge
                                                variant='outline'
                                                className='text-primary border-primary'
                                            >
                                                默认
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            template.createdAt
                                        ).toLocaleString()}
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <div className='flex justify-end gap-2'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={() =>
                                                    navigate({
                                                        to: `/mall/shipping-template/edit/${template.id}` as any,
                                                    })
                                                }
                                            >
                                                <Pencil className='w-4 h-4' />
                                            </Button>
                                            <PopoverConfirm
                                                title='删除模板'
                                                description='确定要删除该运费模板吗？'
                                                onConfirm={() =>
                                                    deleteMutation.mutate(
                                                        template.id
                                                    )
                                                }
                                            >
                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    className='text-destructive'
                                                >
                                                    <Trash2 className='w-4 h-4' />
                                                </Button>
                                            </PopoverConfirm>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
