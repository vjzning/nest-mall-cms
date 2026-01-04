import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { menuApi } from '@/features/menu/api';
import * as LucideIcons from 'lucide-react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MenuSearch() {
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();

    const { data: menus } = useQuery({
        queryKey: ['my-menus'],
        queryFn: menuApi.getMyMenus,
    });

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const filterMenus = React.useMemo(() => {
        if (!menus) return [];
        // 只保留菜单类型 (type === 2) 且有路径的
        return menus.filter((m) => m.type === 2 && m.path && m.path !== '#');
    }, [menus]);

    const getIcon = (name: string) => {
        if (!name) return LucideIcons.FileText;
        const Icon = (LucideIcons as any)[name];
        return Icon || LucideIcons.FileText;
    };

    return (
        <>
            <Button
                variant='outline'
                className={cn(
                    'relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64'
                )}
                onClick={() => setOpen(true)}
            >
                <Search className='mr-2 w-4 h-4' />
                <span className='hidden lg:inline-flex'>搜索菜单...</span>
                <span className='inline-flex lg:hidden'>搜索...</span>
                <kbd className='pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
                    <span className='text-xs'>⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder='输入菜单名称搜索...' />
                <CommandList>
                    <CommandEmpty>未找到相关菜单。</CommandEmpty>
                    <CommandGroup heading='菜单导航'>
                        {filterMenus.map((menu) => {
                            const Icon = getIcon(menu.icon);
                            return (
                                <CommandItem
                                    key={menu.id}
                                    onSelect={() => {
                                        navigate({ to: menu.path });
                                        setOpen(false);
                                    }}
                                >
                                    <Icon className='mr-2 w-4 h-4' />
                                    <span>{menu.name}</span>
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
