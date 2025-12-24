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
import { ScrollArea } from '@/components/ui/scroll-area';

import { TreeSelect } from '@/components/ui/tree-select';

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  cover: z.string().optional(),
  status: z.coerce.number(),
  isRecommend: z.boolean().default(false),
  isTop: z.boolean().default(false),
  categoryId: z.coerce.number().optional(),
  tagIds: z.array(z.number()).optional().default([]),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

interface ArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article?: Article | null;
}

export function ArticleDialog({ open, onOpenChange, article }: ArticleDialogProps) {
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

  const form = useForm({
    resolver: zodResolver(articleSchema),
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
        tagIds: article.tags?.map(t => Number(t.id)) || [],
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
      toast.success('Article created');
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateArticleDto>) => articleApi.update(article!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Article updated');
      onOpenChange(false);
    },
  });

  const onSubmit = (data: ArticleFormValues) => {
    console.log('Submitting:', data); // Debug log
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
    toast.error('Please check the form for errors');
  };

  const toggleTag = (tagId: number) => {
    const currentTags = form.getValues('tagIds');
    if (currentTags.includes(tagId)) {
      form.setValue(
        'tagIds',
        currentTags.filter(id => id !== tagId),
      );
    } else {
      form.setValue('tagIds', [...currentTags, tagId]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{article ? 'Edit Article' : 'Create Article'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="w-full max-h-[65vh] pr-4">
          <form
            id="article-form"
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="p-1 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...form.register('title')} />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" {...form.register('slug')} />
                {form.formState.errors.slug && (
                  <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="categoryId">Category</Label>
                <TreeSelect
                  options={categories || []}
                  value={form.watch('categoryId')?.toString()}
                  onValueChange={val => form.setValue('categoryId', val ? Number(val) : undefined)}
                  placeholder="Select Category"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.watch('status').toString()}
                  onValueChange={val => form.setValue('status', Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Draft</SelectItem>
                    <SelectItem value="1">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 p-2 rounded-md border">
                {tags?.map(tag => (
                  <Button
                    key={tag.id}
                    type="button"
                    variant={form.watch('tagIds')?.includes(Number(tag.id)) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTag(Number(tag.id))}
                    className="h-7 text-xs"
                  >
                    {tag.name}
                  </Button>
                ))}
              </div>
              {form.formState.errors.tagIds && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.tagIds.message ||
                    (Array.isArray(form.formState.errors.tagIds) &&
                      (form.formState.errors.tagIds as any)[0]?.message)}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register('description')} rows={2} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Content (Markdown)</Label>
              <Textarea
                id="content"
                {...form.register('content')}
                className="font-mono"
                rows={10}
              />
              {form.formState.errors.content && (
                <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-2 items-center">
                <Switch
                  id="isRecommend"
                  checked={form.watch('isRecommend')}
                  onCheckedChange={checked => form.setValue('isRecommend', checked)}
                />
                <Label htmlFor="isRecommend">Recommend</Label>
              </div>
              <div className="flex gap-2 items-center">
                <Switch
                  id="isTop"
                  checked={form.watch('isTop')}
                  onCheckedChange={checked => form.setValue('isTop', checked)}
                />
                <Label htmlFor="isTop">Top Pinned</Label>
              </div>
            </div>
          </form>
        </ScrollArea>
        <DialogFooter className="pt-4">
          <Button
            type="submit"
            form="article-form"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {article ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
