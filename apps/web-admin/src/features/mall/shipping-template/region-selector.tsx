import * as React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface RegionNode {
    code: string;
    name: string;
    children?: RegionNode[];
    parentCode?: string;
}

interface FlattenedRegionNode {
    code: string;
    name: string;
    level: number;
    hasChildren: boolean;
    isExpanded: boolean;
    parentCode?: string;
    node: RegionNode;
}

interface RegionSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    options: RegionNode[];
    value: string[];
    onChange: (value: string[]) => void;
    title?: string;
}

export function RegionSelector({
    open,
    onOpenChange,
    options,
    value,
    onChange,
    title = '选择地区',
}: RegionSelectorProps) {
    const [selectedCodes, setSelectedCodes] = React.useState<string[]>(value);
    const [expandedCodes, setExpandedCodes] = React.useState<string[]>([]);
    const [scrollElement, setScrollElement] =
        React.useState<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (open) {
            setSelectedCodes(value);
        }
    }, [open, value]);

    const toggleExpand = (code: string) => {
        setExpandedCodes((prev) =>
            prev.includes(code)
                ? prev.filter((c) => c !== code)
                : [...prev, code]
        );
    };

    const getAllChildCodes = React.useCallback((node: RegionNode): string[] => {
        let codes = [node.code];
        if (node.children) {
            node.children.forEach((child) => {
                codes = [...codes, ...getAllChildCodes(child)];
            });
        }
        return codes;
    }, []);

    const handleSelect = (node: RegionNode, checked: boolean) => {
        const codesToToggle = getAllChildCodes(node);
        if (checked) {
            setSelectedCodes((prev) =>
                Array.from(new Set([...prev, ...codesToToggle]))
            );
        } else {
            setSelectedCodes((prev) =>
                prev.filter((c) => !codesToToggle.includes(c))
            );
        }
    };

    const isAllChildrenSelected = React.useCallback(
        (node: RegionNode): boolean => {
            if (!node.children || node.children.length === 0)
                return selectedCodes.includes(node.code);
            return node.children.every((child) => isAllChildrenSelected(child));
        },
        [selectedCodes]
    );

    const isSomeChildrenSelected = React.useCallback(
        (node: RegionNode): boolean => {
            const allChildCodes = getAllChildCodes(node);
            return allChildCodes.some((c) => selectedCodes.includes(c));
        },
        [selectedCodes, getAllChildCodes]
    );

    const flattenedData = React.useMemo(() => {
        const result: FlattenedRegionNode[] = [];
        const flatten = (nodes: RegionNode[], level = 0) => {
            nodes.forEach((node) => {
                const isExpanded = expandedCodes.includes(node.code);
                const hasChildren = node.children && node.children.length > 0;

                result.push({
                    code: node.code,
                    name: node.name,
                    level,
                    hasChildren: !!hasChildren,
                    isExpanded,
                    parentCode: node.parentCode,
                    node,
                });

                if (hasChildren && isExpanded) {
                    flatten(node.children!, level + 1);
                }
            });
        };
        flatten(options);
        return result;
    }, [options, expandedCodes]);

    const virtualizer = useVirtualizer({
        count: flattenedData.length,
        getScrollElement: () => scrollElement,
        estimateSize: () => 36,
        overscan: 10,
    });

    // 监听 open 状态，在打开时触发虚拟列表重测
    React.useLayoutEffect(() => {
        if (open && scrollElement) {
            // 延迟一下以确保 Dialog 动画结束或容器尺寸稳定
            const timer = setTimeout(() => {
                virtualizer.measure();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [open, scrollElement, virtualizer]);

    const handleConfirm = () => {
        onChange(selectedCodes);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden'>
                <DialogHeader className='px-6 py-4 border-b'>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div
                    ref={setScrollElement}
                    className='flex-1 overflow-auto px-6 py-2'
                >
                    <div
                        style={{
                            height: `${virtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {virtualizer.getVirtualItems().map((virtualRow) => {
                            const item = flattenedData[virtualRow.index];
                            if (!item) return null;
                            const isSelected = isAllChildrenSelected(item.node);
                            const isIndeterminate =
                                !isSelected &&
                                isSomeChildrenSelected(item.node);

                            return (
                                <div
                                    key={item.code}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                    className={cn(
                                        'flex items-center hover:bg-accent rounded-sm cursor-pointer px-2'
                                    )}
                                >
                                    <div
                                        className='flex items-center'
                                        style={{
                                            marginLeft: `${item.level * 24}px`,
                                        }}
                                    >
                                        <div
                                            className='w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-muted rounded'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (item.hasChildren)
                                                    toggleExpand(item.code);
                                            }}
                                        >
                                            {item.hasChildren &&
                                                (item.isExpanded ? (
                                                    <ChevronDown className='h-4 w-4' />
                                                ) : (
                                                    <ChevronRight className='h-4 w-4' />
                                                ))}
                                        </div>
                                        <Checkbox
                                            checked={
                                                isSelected ||
                                                (isIndeterminate
                                                    ? 'indeterminate'
                                                    : false)
                                            }
                                            onCheckedChange={(checked) =>
                                                handleSelect(
                                                    item.node,
                                                    !!checked
                                                )
                                            }
                                            className='mr-2'
                                        />
                                        <span
                                            className='text-sm select-none'
                                            onClick={() =>
                                                item.hasChildren &&
                                                toggleExpand(item.code)
                                            }
                                        >
                                            {item.name}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <DialogFooter className='px-6 py-4 border-t bg-muted/30'>
                    <div className='flex-1 text-sm text-muted-foreground self-center'>
                        已选择: {selectedCodes.length} 个地区
                    </div>
                    <div className='flex gap-2'>
                        <Button
                            variant='outline'
                            onClick={() => onOpenChange(false)}
                        >
                            取消
                        </Button>
                        <Button onClick={handleConfirm}>确认选择</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
