import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Menu } from '../menu/api';
import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MenuTreeProps {
  menus: Menu[];
  value: number[];
  onChange: (value: number[]) => void;
}

interface TreeNode extends Menu {
  children?: TreeNode[];
}

export function MenuTree({ menus, value, onChange }: MenuTreeProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  // Build tree from flat list
  const tree = useMemo(() => {
    const map = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];

    // Initialize all nodes
    menus.forEach((menu) => {
      map.set(Number(menu.id), { ...menu, children: [] });
    });

    // Build hierarchy
    menus.forEach((menu) => {
      const node = map.get(Number(menu.id))!;
      if (menu.parentId && map.has(Number(menu.parentId))) {
        map.get(Number(menu.parentId))!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [menus]);

  const handleCheck = (menuId: number, checked: boolean) => {
    let newValue = [...value];

    // Helper to collect all descendant IDs
    const getDescendantIds = (id: number): number[] => {
      const node = menus.find((m) => Number(m.id) === id);
      if (!node) return [];
      
      const children = menus.filter((m) => Number(m.parentId) === id);
      let ids = children.map((c) => Number(c.id));
      children.forEach((c) => {
        ids = [...ids, ...getDescendantIds(Number(c.id))];
      });
      return ids;
    };

    // Helper to find all ancestor IDs
    const getAncestorIds = (id: number): number[] => {
      const node = menus.find((m) => Number(m.id) === id);
      if (!node || !node.parentId) return [];
      return [Number(node.parentId), ...getAncestorIds(Number(node.parentId))];
    };

    if (checked) {
      // Add current
      if (!newValue.includes(menuId)) newValue.push(menuId);
      
      // Add all descendants
      const descendants = getDescendantIds(menuId);
      descendants.forEach(id => {
        if (!newValue.includes(id)) newValue.push(id);
      });

      // Add all ancestors (to ensure path is accessible)
      const ancestors = getAncestorIds(menuId);
      ancestors.forEach(id => {
        if (!newValue.includes(id)) newValue.push(id);
      });
    } else {
      // Remove current
      newValue = newValue.filter((id) => id !== menuId);
      
      // Remove all descendants
      const descendants = getDescendantIds(menuId);
      newValue = newValue.filter((id) => !descendants.includes(id));
    }

    onChange(newValue.map(Number));
  };

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[Number(node.id)];
    const isChecked = value.includes(Number(node.id));

    return (
      <div key={node.id} className="select-none">
        <div 
            className={cn(
                "flex items-center py-1 hover:bg-muted/50 rounded-sm px-2",
                level > 0 && "ml-4"
            )}
        >
            {hasChildren ? (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 mr-1 p-0 hover:bg-transparent"
                    onClick={() => toggleExpand(Number(node.id))}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                    ) : (
                        <ChevronRight className="h-3 w-3" />
                    )}
                </Button>
            ) : (
                <div className="w-5 mr-1" /> // Spacer for alignment
            )}
            
            <div className="flex items-center space-x-2">
                <Checkbox
                    id={`menu-${node.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheck(Number(node.id), checked as boolean)}
                />
                <Label 
                    htmlFor={`menu-${node.id}`} 
                    className="cursor-pointer font-normal flex items-center"
                >
                    {node.name}
                    <span className="text-xs text-muted-foreground ml-2">
                        {node.type === 1 ? '(Dir)' : node.type === 2 ? '(Menu)' : '(Btn)'}
                    </span>
                </Label>
            </div>
        </div>
        
        {hasChildren && isExpanded && (
            <div className="border-l border-border ml-[11px]">
                 {node.children!.map((child) => renderNode(child, level + 1))}
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {tree.map((node) => renderNode(node))}
    </div>
  );
}
