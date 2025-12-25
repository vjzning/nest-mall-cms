import * as React from 'react';
import { Check, ChevronsUpDown, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface TreeSelectOption {
  id: string | number;
  name: string;
  parentId?: string | number | null;
  children?: TreeSelectOption[];
  level?: number;
  disabled?: boolean;
}

interface TreeSelectProps {
  options: TreeSelectOption[];
  value?: string | number;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

function flattenOptions(
  options: TreeSelectOption[],
  level = 0,
): (TreeSelectOption & { level: number })[] {
  let result: (TreeSelectOption & { level: number })[] = [];

  for (const option of options) {
    result.push({ ...option, level });
    if (option.children && option.children.length > 0) {
      result = result.concat(flattenOptions(option.children, level + 1));
    }
  }

  return result;
}

export function TreeSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  emptyText = 'No results found.',
  className,
  disabled = false,
}: TreeSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Helper function to build tree from flat list
  function buildTree(items: TreeSelectOption[]): TreeSelectOption[] {
    const map = new Map<string, TreeSelectOption>();
    const roots: TreeSelectOption[] = [];

    // Clone items to avoid mutating original array and ensure children array exists
    // Also ensure id is string for consistent mapping
    const nodes = items.map(item => ({ ...item, children: [], id: String(item.id) }));

    nodes.forEach(node => {
      map.set(node.id, node);
    });

    nodes.forEach(node => {
      const parentId = node.parentId ? String(node.parentId) : null;
      if (parentId && parentId !== '0' && map.has(parentId)) {
        const parent = map.get(parentId);
        parent?.children?.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  const flatOptions = React.useMemo(() => {
    // If options seem flat (no children property used on first few items), try to build tree
    // We assume if data comes flat, it likely needs tree building if parentId exists
    const hasChildren = options.some(o => o.children && o.children.length > 0);

    if (!hasChildren && options.length > 0) {
      const tree = buildTree(options);
      return flattenOptions(tree);
    }

    return flattenOptions(options);
  }, [options]);

  const selectedOption = React.useMemo(() => {
    return flatOptions.find(opt => String(opt.id) === String(value));
  }, [flatOptions, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between w-full', className)}
          disabled={disabled}
        >
          {selectedOption ? (
            selectedOption.name
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 w-4 h-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {flatOptions.map(option => (
                <CommandItem
                  key={option.id}
                  value={option.id.toString() + ' ' + option.name} // Include name for search
                  onSelect={() => {
                    onValueChange(option.id);
                    setOpen(false);
                  }}
                  disabled={option.disabled}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      String(value) === String(option.id) ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <div
                    className="flex gap-1 items-center"
                    style={{ paddingLeft: `${(option.level || 0) * 20}px` }}
                  >
                    {(option.level || 0) > 0 && (
                      <span className="mr-1 text-muted-foreground/50">└─</span>
                    )}
                    {option.name}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
