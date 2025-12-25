import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceApi, type Resource } from '@/features/resource/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, UploadCloud, Check, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

interface ImagePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  multiple?: boolean; // For future support if needed, currently single selection return
}

export function ImagePickerDialog({ open, onOpenChange, onSelect }: ImagePickerProps) {
  const [activeTab, setActiveTab] = useState('library');
  const [search, setSearch] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Resource Library
  const { data, isLoading } = useQuery({
    queryKey: ['resources', search],
    queryFn: () => resourceApi.findAll({ filename: search, limit: 50 }),
    enabled: open && activeTab === 'library',
  });

  // Upload Logic
  const uploadMutation = useMutation({
    mutationFn: resourceApi.upload,
    onSuccess: res => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Image uploaded');
      setActiveTab('library');
      // Auto select uploaded image?
      // setSelectedUrl(res.url);
    },
    onError: () => {
      toast.error('Upload failed');
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
    onDrop: acceptedFiles => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[600px] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Select Image</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex overflow-hidden flex-col flex-1"
        >
          <div className="px-6 border-b">
            <TabsList className="justify-start p-0 w-full bg-transparent rounded-none border-b-0">
              <TabsTrigger
                value="library"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Library
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Upload New
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="library" className="overflow-hidden p-0 m-0 h-full">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search images..."
                    className="pl-8"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {data?.items
                      .filter(item => item.mimeType.startsWith('image/'))
                      .map(item => (
                        <div
                          key={item.id}
                          className={cn(
                            'relative group aspect-square rounded-md border overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50',
                            selectedUrl === item.url && 'ring-2 ring-primary',
                          )}
                          onClick={() => setSelectedUrl(item.url)}
                        >
                          <img
                            src={item.url}
                            alt={item.originalName}
                            className="object-cover w-full h-full"
                          />
                          {selectedUrl === item.url && (
                            <div className="flex absolute inset-0 justify-center items-center bg-primary/20">
                              <div className="p-1 rounded-full bg-primary text-primary-foreground">
                                <Check className="w-4 h-4" />
                              </div>
                            </div>
                          )}
                          <div className="absolute right-0 bottom-0 left-0 p-1 text-xs text-white truncate opacity-0 transition-opacity bg-black/60 group-hover:opacity-100">
                            {item.originalName}
                          </div>
                        </div>
                      ))}
                    {(!data?.items || data.items.length === 0) && (
                      <div className="col-span-4 py-10 text-center text-muted-foreground">
                        No images found
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              <div className="flex gap-2 justify-end p-4 border-t">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirm} disabled={!selectedUrl}>
                  Select
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="flex-1 p-0 m-0">
            <div
              {...getRootProps()}
              className={cn(
                'flex flex-col justify-center items-center m-6 h-[80%] rounded-lg border-2 border-dashed transition-colors cursor-pointer',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50',
              )}
            >
              <input {...getInputProps()} />
              {uploadMutation.isPending ? (
                <div className="text-center">
                  <Loader2 className="mx-auto mb-4 w-10 h-10 animate-spin text-primary" />
                  <p>Uploading...</p>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="mx-auto mb-4 w-10 h-10 text-muted-foreground" />
                  <p className="text-lg font-medium">Drag & drop image here</p>
                  <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
