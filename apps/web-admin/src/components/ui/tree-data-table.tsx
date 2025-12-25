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
import { useState, useMemo, Fragment, type ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown } from 'lucide-react';

// TreeSelect Components
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
  prefix = ''
): (TreeSelectOption & { level: number; prefix: string })[] {
  let result: (TreeSelectOption & { level: number; prefix: string })[] = [];

  for (const option of options) {
    result.push({ ...option, level, prefix });
    if (option.children && option.children.length > 0) {
      result = result.concat(flattenOptions(option.children, level + 1, prefix + '└─ '));
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

    // Clone items
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
    const hasChildren = options.some(o => o.children && o.children.length > 0);
    let tree = options;
    if (!hasChildren && options.length > 0) {
      tree = buildTree(options);
    }
    return flattenOptions(tree);
  }, [options]);

  const selectedOption = React.useMemo(() => {
    // Search in original options to find name by ID, or flatOptions
    // flatOptions covers all
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
                  value={option.id.toString() + ' ' + option.name} 
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
                    style={{ paddingLeft: `${(option.level || 0) * 16}px` }}
                  >
                    {(option.level || 0) > 0 && (
                       <span className="text-muted-foreground/50 mr-1">└─</span>
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

// TreeDataTable Components
export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  width?: string;
  className?: string;
}

interface TreeDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  idField?: keyof T;
  parentIdField?: keyof T;
  actionColumn?: (row: T) => ReactNode;
  defaultExpandAll?: boolean;
}

interface TreeNode<T> {
  data: T;
  children: TreeNode<T>[];
  level: number;
}

export function TreeDataTable<T extends Record<string, any>>({
  data,
  columns,
  idField = 'id',
  parentIdField = 'parentId',
  actionColumn,
  defaultExpandAll = false,
}: TreeDataTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string | number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [String(id)]: !prev[String(id)],
    }));
  };

  const treeData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const map = new Map<string, TreeNode<T>>();
    const roots: TreeNode<T>[] = [];

    // First pass: create nodes
    data.forEach((item) => {
      const id = String(item[idField]);
      map.set(id, { data: item, children: [], level: 0 });
    });

    // Second pass: build hierarchy
    data.forEach((item) => {
      const id = String(item[idField]);
      const node = map.get(id)!;
      const parentId = item[parentIdField];

      if (parentId && parentId !== 0 && parentId !== '0' && map.has(String(parentId))) {
        const parent = map.get(String(parentId))!;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const setLevels = (nodes: TreeNode<T>[], level: number) => {
      nodes.forEach(node => {
        node.level = level;
        if (node.children.length > 0) {
            setLevels(node.children, level + 1);
        }
      });
    };
    
    setLevels(roots, 0);

    return roots;
  }, [data, idField, parentIdField]);

  const renderRow = (node: TreeNode<T>) => {
    const { data: row, children, level } = node;
    const id = String(row[idField]);
    const hasChildren = children && children.length > 0;
    const isExpanded = expandedRows[id] ?? defaultExpandAll;

    return (
      <Fragment key={id}>
        <TableRow>
          {columns.map((col, index) => {
            const isFirst = index === 0;
            return (
              <TableCell key={String(col.accessorKey) || index} className={cn(col.className, isFirst && "font-medium")}>
                {isFirst ? (
                  <div
                    className="flex items-center"
                    style={{ paddingLeft: `${level * 24}px` }}
                  >
                    {hasChildren ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mr-1 p-0 hover:bg-transparent"
                        onClick={() => toggleExpand(id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      <div className="w-7 inline-block" />
                    )}
                    {col.cell ? col.cell(row) : (col.accessorKey ? row[col.accessorKey] : null)}
                  </div>
                ) : (
                  col.cell ? col.cell(row) : (col.accessorKey ? row[col.accessorKey] : null)
                )}
              </TableCell>
            );
          })}
          {actionColumn && (
            <TableCell className="text-right">
              {actionColumn(row)}
            </TableCell>
          )}
        </TableRow>
        {isExpanded && hasChildren && children.map((child) => renderRow(child))}
      </Fragment>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, index) => (
              <TableHead key={String(col.accessorKey) || index} className={col.width ? `w-[${col.width}]` : undefined}>
                {col.header}
              </TableHead>
            ))}
            {actionColumn && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {treeData.length > 0 ? (
            treeData.map((node) => renderRow(node))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + (actionColumn ? 1 : 0)} className="h-24 text-center text-muted-foreground">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
