import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCollection,
  createCollection,
  updateCollection,
} from './api';
import { CollectionType, CollectionLayout } from '@app/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Plus, ArrowLeft, Save, Image as ImageIcon, GripVertical, Search } from 'lucide-react';
import { toast } from 'sonner';
import { ImagePickerDialog } from '@/components/ui/image-picker-dialog';
import { ContentPicker, type ContentType } from '@/components/content-picker';

export default function CollectionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id?: string };
  const isEdit = !!id;
  const queryClient = useQueryClient();

  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [contentPickerOpen, setContentPickerOpen] = useState(false);
  const [pickerType, setPickerType] = useState<ContentType>('product');
  const [isBulkAdd, setIsBulkAdd] = useState(false);

  const form = useForm({
    defaultValues: {
      code: '',
      type: CollectionType.PRODUCT,
      title: '',
      subtitle: '',
      description: '',
      coverImage: '',
      layoutType: CollectionLayout.GRID,
      bgColor: '',
      status: 1,
      sort: 0,
      metadata: {},
      items: [],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = form;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'items',
  });

  const coverImage = watch('coverImage');

  // Fetch data if edit
  const { data: collection } = useQuery({
    queryKey: ['collection', id],
    queryFn: () => getCollection(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (collection) {
      reset({
        ...collection,
        items: collection.items || [],
      });
    }
  }, [collection, reset]);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit ? updateCollection(Number(id), data) : createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success(`Collection ${isEdit ? 'updated' : 'created'}`);
      navigate({ to: '/mall/collection' });
    },
    onError: () => {
      toast.error('Failed to save collection');
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  const handleImageSelect = (url: string) => {
    if (activeItemIndex !== null) {
      setValue(`items.${activeItemIndex}.imageOverride` as any, url);
      setActiveItemIndex(null);
    } else {
      setValue('coverImage', url);
    }
  };

  const handleContentSelect = (selected: any[]) => {
    if (isBulkAdd) {
      selected.forEach(item => {
        append({ targetId: item.id, sort: 0 });
      });
    } else if (activeItemIndex !== null) {
      setValue(`items.${activeItemIndex}.targetId` as any, selected[0].id);
    }
    setActiveItemIndex(null);
  };

  const openPicker = (type: ContentType, index: number | null = null, bulk = false) => {
    setPickerType(type);
    setActiveItemIndex(index);
    setIsBulkAdd(bulk);
    setContentPickerOpen(true);
  };

  const collectionType = watch('type');
  // Map collection type to picker type
  const getPickerType = (type: CollectionType): ContentType => {
    if (type === CollectionType.CATEGORY) return 'category';
    if (type === CollectionType.ARTICLE) return 'article';
    return 'product';
  };

  return (
    <div className="flex flex-col gap-4 pb-10 mx-auto w-full max-w-5xl">
      <div className="flex gap-4 items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/mall/collection' })}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
          {isEdit ? 'Edit Collection' : 'Create Collection'}
        </h2>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={() => navigate({ to: '/mall/collection' })}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={mutation.isPending}>
            <Save className="mr-2 w-4 h-4" /> Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Code (Unique)</Label>
                  <Input {...register('code', { required: true })} placeholder="e.g. SUMMER_SALE" />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select
                    value={watch('type')}
                    onValueChange={(val) => setValue('type', val as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CollectionType).map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Title</Label>
                <Input {...register('title', { required: true })} placeholder="Collection Title" />
              </div>

              <div className="grid gap-2">
                <Label>Subtitle</Label>
                <Input {...register('subtitle')} placeholder="Catchy subtitle" />
              </div>

              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea {...register('description')} placeholder="Marketing text..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Items</CardTitle>
                <CardDescription>Products or entities in this collection</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openPicker(getPickerType(collectionType), null, true)}
                >
                  <Search className="mr-2 h-4 w-4" /> Bulk Add
                </Button>
                <Button size="sm" variant="outline" onClick={() => append({ targetId: 0, sort: 0 })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Target ID</TableHead>
                    <TableHead>Title Override</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Sort</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            {...register(`items.${index}.targetId` as any, { valueAsNumber: true })}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => openPicker(getPickerType(collectionType), index, false)}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input {...register(`items.${index}.titleOverride` as any)} placeholder="Keep empty to use default" />
                      </TableCell>
                      <TableCell>
                        <div
                          className="w-10 h-10 border rounded cursor-pointer flex items-center justify-center bg-muted/20"
                          onClick={() => {
                            setActiveItemIndex(index);
                            setCoverPickerOpen(true);
                          }}
                        >
                          {watch(`items.${index}.imageOverride` as any) ? (
                            <img src={watch(`items.${index}.imageOverride` as any)} className="w-full h-full object-cover rounded" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-20"
                          {...register(`items.${index}.sort` as any, { valueAsNumber: true })}
                        />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {fields.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground text-sm">
                        No items added yet. Click Add Item to start.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display & Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Layout Type</Label>
                <Select
                  value={watch('layoutType')}
                  onValueChange={(val) => setValue('layoutType', val as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CollectionLayout).map((l) => (
                      <SelectItem key={l} value={l} className="capitalize">{l.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input {...register('bgColor')} placeholder="#ffffff or transparent" />
                  <div className="w-10 h-10 rounded border" style={{ backgroundColor: watch('bgColor') || 'white' }} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Cover Image</Label>
                <div
                  className="w-full aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => {
                    setActiveItemIndex(null);
                    setCoverPickerOpen(true);
                  }}
                >
                  {coverImage ? (
                    <img src={coverImage} className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Click to select cover</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Label>Status (Active)</Label>
                <Switch
                  checked={watch('status') === 1}
                  onCheckedChange={(c) => setValue('status', c ? 1 : 0)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Sort Order</Label>
                <Input type="number" {...register('sort', { valueAsNumber: true })} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ImagePickerDialog
        open={coverPickerOpen}
        onOpenChange={setCoverPickerOpen}
        onSelect={handleImageSelect}
      />

      <ContentPicker
        open={contentPickerOpen}
        onOpenChange={setContentPickerOpen}
        type={pickerType}
        selectionMode={isBulkAdd ? 'multiple' : 'single'}
        onSelect={handleContentSelect}
      />
    </div>
  );
}
