import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, X } from 'lucide-react';
import { ImagePickerDialog } from './image-picker-dialog';
import { cn } from '@/lib/utils';

interface ImagePickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  imageClassName?: string;
  placeholder?: string;
}

export function ImagePicker({ value, onChange, className, imageClassName, placeholder = '选择图片' }: ImagePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={cn('flex flex-col gap-2', className)}>
        {value ? (
          <div className={cn("relative w-full aspect-square rounded-md border overflow-hidden group", imageClassName)}>
            <img
              src={value}
              alt="Selected"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div 
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer -z-10 group-hover:z-0"
                onClick={() => setOpen(true)}
            >
                <span className="text-white text-xs font-medium">更换图片</span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setOpen(true)}
            className="w-full aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
          >
            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground">{placeholder}</span>
          </div>
        )}
      </div>

      <ImagePickerDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={(url) => {
            onChange(url);
        }}
      />
    </>
  );
}
