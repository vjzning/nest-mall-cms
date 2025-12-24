import { useState, useMemo, Fragment, ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        // We defer level calculation until we traverse or we can do it recursively later
      } else {
        roots.push(node);
      }
    });

    // Helper to set levels and sort (if needed, assuming data comes sorted or we preserve order)
    const setLevels = (nodes: TreeNode<T>[], level: number) => {
      nodes.forEach(node => {
        node.level = level;
        if (node.children.length > 0) {
            setLevels(node.children, level + 1);
        }
      });
    };
    
    setLevels(roots, 0);

    // Sort roots and children based on sort order if available? 
    // The generic component shouldn't assume 'sort' field exists unless specified.
    // For now, we assume the input `data` order matters or the user sorts it before passing.
    // However, for tree reconstruction, the order of children depends on insertion order above.
    // If original data was sorted, this might preserve it.
    // Let's assume the user passes sorted data.

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
