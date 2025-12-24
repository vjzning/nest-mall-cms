import { useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { menuApi } from '@/features/menu/api';
import * as LucideIcons from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
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
    const roots = menus.filter(m => !m.parentId || String(m.parentId) === '0');
    
    // Sort roots
    roots.sort((a, b) => (a.sort || 0) - (b.sort || 0));

    const groups: MenuGroup[] = [];

    // Handle root directories
    roots.forEach(root => {
        if (root.type === 1) {
            // It's a directory, find its children
            const items = menus
                .filter(m => String(m.parentId) === String(root.id) && m.type === 2)
                .sort((a, b) => (a.sort || 0) - (b.sort || 0))
                .map(item => ({
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
            let generalGroup = groups.find(g => g.label === 'General');
            if (!generalGroup) {
                generalGroup = { label: 'General', items: [] };
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentLabel = menuGroups
    .flatMap((group) => group.items)
    .find((item) => item.path === location.pathname)?.label;

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <h1 className="text-xl font-bold">CMS Admin</h1>
          </SidebarHeader>
          <SidebarContent>
            {menuGroups.map((group, index) => (
              <SidebarGroup key={index}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.label}
                          >
                            <Link to={item.path}>
                              <Icon />
                              <span>{item.label}</span>
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
          <SidebarFooter className="p-4 border-t">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 items-center">
                <Avatar>
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback><LucideIcons.User /></AvatarFallback>
                </Avatar>
                <div className="flex overflow-hidden flex-col">
                  <span className="text-sm font-medium truncate">
                    {user?.username || 'User'}
                  </span>
                  <span className="text-xs truncate text-muted-foreground">
                    {user?.email || 'admin@example.com'}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="gap-2 justify-start w-full"
                onClick={handleLogout}
              >
                <LucideIcons.LogOut size={16} />
                Logout
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="overflow-auto flex-1">
            <div className="flex gap-4 items-center p-4 border-b">
                <SidebarTrigger />
                <h2 className="text-lg font-semibold">
                    {currentLabel || 'Dashboard'}
                </h2>
            </div>
            <div className="p-8">
                {children}
            </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
