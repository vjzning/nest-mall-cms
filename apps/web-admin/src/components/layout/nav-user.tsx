import { CircleUser, CreditCard, EllipsisVertical, LogOut } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/auth.store';
import { useNavigate } from '@tanstack/react-router';

export function NavUser() {
    const { isMobile } = useSidebar();

    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate({ to: '/login' });
    };
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size='lg'
                            className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                        >
                            <Avatar className='w-8 h-8 rounded-lg grayscale'>
                                <AvatarImage
                                    src={user.avatar || undefined}
                                    alt={user.name}
                                />
                                <AvatarFallback className='rounded-lg'>
                                    {user.name}
                                </AvatarFallback>
                            </Avatar>
                            <div className='grid flex-1 text-sm leading-tight text-left'>
                                <span className='font-medium truncate'>
                                    {user.name}
                                </span>
                                <span className='text-xs truncate text-muted-foreground'>
                                    {user.email}
                                </span>
                            </div>
                            <EllipsisVertical className='ml-auto size-4' />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                        side={isMobile ? 'bottom' : 'right'}
                        align='end'
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className='p-0 font-normal'>
                            <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                                <Avatar className='w-8 h-8 rounded-lg'>
                                    <AvatarImage
                                        src={user.avatar || undefined}
                                        alt={user.name}
                                    />
                                    <AvatarFallback className='rounded-lg'>
                                        {user.name}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='grid flex-1 text-sm leading-tight text-left'>
                                    <span className='font-medium truncate'>
                                        {user.name}
                                    </span>
                                    <span className='text-xs truncate text-muted-foreground'>
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <CircleUser />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard />
                                Billing
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
