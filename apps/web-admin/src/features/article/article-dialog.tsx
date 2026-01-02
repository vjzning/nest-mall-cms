import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { articleApi, type CreateArticleDto, type Article } from './api';
import { categoryApi } from '../category/api';
import { tagApi } from '../tag/api';
import { useEffect } from 'react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { TreeSelect } from '@/components/ui/tree-select';
import { ImagePicker } from '@/components/ui/image-picker';

const articleSchema = z.object({
    title: z.string().min(1, '标题必填'),
    slug: z.string().min(1, '别名必填'),
    description: z.string().optional(),
    content: z.string().min(1, '内容必填'),
    cover: z.string().optional(),
    status: z.number().default(0),
    isRecommend: z.boolean().default(false),
    isTop: z.boolean().default(false),
    categoryId: z.number().optional(),
    tagIds: z.array(z.number()).default([]),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

interface ArticleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    article?: Article | null;
}

export function ArticleDialog({
    open,
    onOpenChange,
    article,
}: ArticleDialogProps) {
    const queryClient = useQueryClient();

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryApi.findAll,
        enabled: open,
    });

    const { data: tags } = useQuery({
        queryKey: ['tags'],
        queryFn: tagApi.findAll,
        enabled: open,
    });

    const form = useForm<ArticleFormValues>({
        resolver: zodResolver(articleSchema) as any,
        defaultValues: {
            title: '',
            slug: '',
            description: '',
            content: '',
            cover: '',
            status: 0,
            isRecommend: false,
            isTop: false,
            categoryId: undefined,
            tagIds: [],
        },
    });

    useEffect(() => {
        if (article) {
            form.reset({
                title: article.title,
                slug: article.slug,
                description: article.description || '',
                content: article.content,
                cover: article.cover || '',
                status: article.status,
                isRecommend: !!article.isRecommend,
                isTop: !!article.isTop,
                categoryId: article.categoryId,
                tagIds: article.tags?.map((t) => Number(t.id)) || [],
            });
        } else {
            form.reset({
                title: '',
                slug: '',
                description: '',
                content: '',
                cover: '',
                status: 0,
                isRecommend: false,
                isTop: false,
                categoryId: undefined,
                tagIds: [],
            });
        }
    }, [article, form]);

    const createMutation = useMutation({
        mutationFn: (data: any) => articleApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            toast.success('创建成功');
            onOpenChange(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<CreateArticleDto>) =>
            articleApi.update(article!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            toast.success('更新成功');
            onOpenChange(false);
        },
    });

    const onSubmit = (data: ArticleFormValues) => {
        const payload = {
            ...data,
            isRecommend: data.isRecommend ? 1 : 0,
            isTop: data.isTop ? 1 : 0,
        };
        if (article) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const onError = (errors: any) => {
        console.error('Form errors:', errors);
        toast.error('表单校验失败，请检查输入');
    };

    const toggleTag = (tagId: number) => {
        const currentTags = form.getValues('tagIds') || [];
        if (currentTags.includes(tagId)) {
            form.setValue(
                'tagIds',
                currentTags.filter((id) => id !== tagId)
            );
        } else {
            form.setValue('tagIds', [...currentTags, tagId]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[900px] h-[90vh] flex flex-col p-0 gap-0'>
                <DialogHeader className='p-6 pb-2'>
                    <DialogTitle>
                        {article ? '编辑文章' : '创建文章'}
                    </DialogTitle>
                </DialogHeader>
                <div className='flex-1 overflow-y-auto px-6'>
                    <form
                        id='article-form'
                        onSubmit={form.handleSubmit(onSubmit, onError)}
                        className='py-4 space-y-6'
                    >
                        <div className='grid grid-cols-4 gap-6'>
                            <div className='col-span-3 space-y-4'>
                                <div className='grid gap-2'>
                                    <Label htmlFor='title'>标题</Label>
                                    <Input
                                        id='title'
                                        {...form.register('title')}
                                        placeholder='请输入文章标题'
                                    />
                                    {form.formState.errors.title && (
                                        <p className='text-sm text-destructive'>
                                            {
                                                form.formState.errors.title
                                                    .message
                                            }
                                        </p>
                                    )}
                                </div>
                                <div className='grid gap-2'>
                                    <Label htmlFor='slug'>别名 (Slug)</Label>
                                    <Input
                                        id='slug'
                                        {...form.register('slug')}
                                        placeholder='请输入文章别名，如: my-first-article'
                                    />
                                    {form.formState.errors.slug && (
                                        <p className='text-sm text-destructive'>
                                            {form.formState.errors.slug.message}
                                        </p>
                                    )}
                                </div>

                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='grid gap-2'>
                                        <Label htmlFor='categoryId'>分类</Label>
                                        <TreeSelect
                                            options={categories || []}
                                            value={form
                                                .watch('categoryId')
                                                ?.toString()}
                                            onValueChange={(val) =>
                                                form.setValue(
                                                    'categoryId',
                                                    val
                                                        ? Number(val)
                                                        : undefined
                                                )
                                            }
                                            placeholder='请选择分类'
                                        />
                                    </div>
                                    <div className='grid gap-2'>
                                        <Label htmlFor='status'>状态</Label>
                                        <Select
                                            value={
                                                form
                                                    .watch('status')
                                                    ?.toString() || '0'
                                            }
                                            onValueChange={(val) =>
                                                form.setValue(
                                                    'status',
                                                    Number(val)
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder='请选择状态' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='0'>
                                                    草稿
                                                </SelectItem>
                                                <SelectItem value='1'>
                                                    待审核
                                                </SelectItem>
                                                <SelectItem value='2'>
                                                    已发布
                                                </SelectItem>
                                                <SelectItem value='4'>
                                                    下线
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className='grid gap-2'>
                                    <Label>标签</Label>
                                    <div className='flex flex-wrap gap-2 p-2 rounded-md border bg-muted/5'>
                                        {tags?.map((tag) => (
                                            <Button
                                                key={tag.id}
                                                type='button'
                                                variant={
                                                    form
                                                        .watch('tagIds')
                                                        ?.includes(
                                                            Number(tag.id)
                                                        )
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size='sm'
                                                onClick={() =>
                                                    toggleTag(Number(tag.id))
                                                }
                                                className='h-7 text-xs'
                                            >
                                                {tag.name}
                                            </Button>
                                        ))}
                                        {(!tags || tags.length === 0) && (
                                            <span className='text-xs text-muted-foreground italic'>
                                                暂无标签
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className='col-span-1 space-y-4'>
                                <div className='grid gap-2'>
                                    <Label>主图</Label>
                                    <ImagePicker
                                        value={form.watch('cover')}
                                        onChange={(val) =>
                                            form.setValue('cover', val)
                                        }
                                        placeholder='上传主图'
                                        imageClassName='aspect-[4/3]'
                                    />
                                    <p className='text-[10px] text-muted-foreground'>
                                        建议 4:3 比例
                                    </p>
                                </div>

                                <div className='space-y-3 p-3 rounded-lg border bg-muted/5'>
                                    <div className='flex justify-between items-center'>
                                        <Label
                                            htmlFor='isRecommend'
                                            className='text-xs cursor-pointer'
                                        >
                                            推荐
                                        </Label>
                                        <Switch
                                            id='isRecommend'
                                            className='scale-75'
                                            checked={form.watch('isRecommend')}
                                            onCheckedChange={(checked) =>
                                                form.setValue(
                                                    'isRecommend',
                                                    checked
                                                )
                                            }
                                        />
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <Label
                                            htmlFor='isTop'
                                            className='text-xs cursor-pointer'
                                        >
                                            置顶
                                        </Label>
                                        <Switch
                                            id='isTop'
                                            className='scale-75'
                                            checked={form.watch('isTop')}
                                            onCheckedChange={(checked) =>
                                                form.setValue('isTop', checked)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='grid gap-2'>
                            <Label htmlFor='description'>摘要</Label>
                            <Textarea
                                id='description'
                                {...form.register('description')}
                                rows={3}
                                placeholder='请输入文章摘要，不填则默认截取内容前部'
                            />
                        </div>

                        <div className='grid gap-2'>
                            <Label htmlFor='content'>内容 (Markdown)</Label>
                            <Textarea
                                id='content'
                                {...form.register('content')}
                                className='font-mono min-h-[300px]'
                                rows={15}
                                placeholder='请输入文章内容，支持 Markdown 语法'
                            />
                            {form.formState.errors.content && (
                                <p className='text-sm text-destructive'>
                                    {form.formState.errors.content.message}
                                </p>
                            )}
                        </div>
                    </form>
                </div>
                <DialogFooter className='px-6 py-4 border-t'>
                    <Button
                        variant='outline'
                        onClick={() => onOpenChange(false)}
                    >
                        取消
                    </Button>
                    <Button
                        type='submit'
                        form='article-form'
                        disabled={
                            createMutation.isPending || updateMutation.isPending
                        }
                    >
                        {createMutation.isPending ||
                        updateMutation.isPending ? (
                            <Loader2 className='mr-2 w-4 h-4 animate-spin' />
                        ) : null}
                        {article ? '保存修改' : '立即创建'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
