import { useMemo } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { menuApi } from '@/features/menu/api';
import * as LucideIcons from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { NotificationCenter } from '@/components/notification-center';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { NavUser } from './nav-user';
import { MenuSearch } from './menu-search';
import { Logo } from '@/components/ui/logo';

interface AppSidebarProps {
    children?: React.ReactNode;
}

interface MenuItem {
    label: string;
    path: string;
    icon: React.ComponentType<any>;
}

interface MenuGroup {
    label: string;
    items: MenuItem[];
}

const getIcon = (name: string) => {
    if (!name) return LucideIcons.FileText;
    const Icon = LucideIcons[name];
    return Icon || LucideIcons.FileText;
};

export function AppSidebar({ children }: AppSidebarProps) {
    const location = useLocation();

    const { data: menus } = useQuery({
        queryKey: ['my-menus'],
        queryFn: menuApi.getMyMenus,
    });

    const menuGroups = useMemo<MenuGroup[]>(() => {
        if (!menus) {
            return [];
        }

        // Find roots (directories) - assuming type 1 is Directory
        // Also handle case where items are at root level (parentId is 0 or null)
        // IMPORTANT: parentId might be string "0" or number 0, or null
        const roots = menus.filter(
            (m) => !m.parentId || String(m.parentId) === '0'
        );

        // Sort roots
        roots.sort((a, b) => (a.sort || 0) - (b.sort || 0));

        const groups: MenuGroup[] = [];

        // Handle root directories
        roots.forEach((root) => {
            if (root.type === 1) {
                // It's a directory, find its children
                const items = menus
                    .filter(
                        (m) =>
                            String(m.parentId) === String(root.id) &&
                            m.type === 2
                    )
                    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
                    .map((item) => ({
                        label: item.name,
                        path: item.path || '#',
                        icon: getIcon(item.icon),
                    }));

                // Even if items is empty, we might want to show the group label?
                // But usually empty groups are hidden.
                if (items.length > 0) {
                    groups.push({
                        label: root.name,
                        items,
                    });
                }
            } else if (root.type === 2) {
                // It's a menu at root level
                let generalGroup = groups.find((g) => g.label === '常规');
                if (!generalGroup) {
                    generalGroup = { label: '常规', items: [] };
                    groups.push(generalGroup);
                }
                generalGroup.items.push({
                    label: root.name,
                    path: root.path || '#',
                    icon: getIcon(root.icon),
                });
            }
        });

        return groups;
    }, [menus]);

    const currentItem = useMemo(() => {
        const allItems = menuGroups.flatMap((group) => group.items);

        // 优先精确匹配
        const exactMatch = allItems.find(
            (item) => item.path === location.pathname
        );
        if (exactMatch) return exactMatch;

        // 前缀匹配（排除根路径和空路径），按长度倒序以确保匹配最深层路径
        return allItems
            .filter(
                (item) => item.path && item.path !== '/' && item.path !== '#'
            )
            .sort((a, b) => b.path.length - a.path.length)
            .find((item) => location.pathname.startsWith(item.path));
    }, [menuGroups, location.pathname]);

    const currentLabel = currentItem?.label;

    return (
        <SidebarProvider>
            <div className='flex overflow-hidden w-full h-screen'>
                <Sidebar variant='floating' collapsible='icon'>
                    <SidebarHeader className='p-4 border-b'>
                        <div className='flex gap-3 items-center'>
                            <Logo className='w-8 h-8 shrink-0' />
                            <h1 className='text-xl font-bold truncate group-data-[collapsible=icon]:hidden'>
                                后台管理系统
                            </h1>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        {menuGroups.map((group, index) => (
                            <SidebarGroup key={index}>
                                <SidebarGroupLabel>
                                    {group.label}
                                </SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            // 如果是当前路径，或者是该菜单路径下的子路径（排除根路径），则视为激活
                                            const isActive =
                                                location.pathname ===
                                                    item.path ||
                                                (item.path !== '/' &&
                                                    item.path !== '#' &&
                                                    location.pathname.startsWith(
                                                        item.path
                                                    ));
                                            return (
                                                <SidebarMenuItem
                                                    key={item.path}
                                                >
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={isActive}
                                                        tooltip={item.label}
                                                    >
                                                        <Link to={item.path}>
                                                            <Icon />
                                                            <span>
                                                                {item.label}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        ))}
                    </SidebarContent>
                    <SidebarFooter className='p-4 border-t'>
                        <NavUser />
                    </SidebarFooter>
                </Sidebar>
                <main className='flex overflow-hidden flex-col flex-1 min-h-0'>
                    <div className='flex gap-4 items-center p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20'>
                        <SidebarTrigger />
                        <h2 className='flex-1 text-lg font-semibold'>
                            {currentLabel || '仪表盘'}
                        </h2>
                        <div className='flex gap-2 items-center'>
                            <MenuSearch />
                            <NotificationCenter />
                            <ModeToggle />
                        </div>
                    </div>
                    <div className='overflow-auto flex-1'>
                        <div className='p-8'>{children}</div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
