import { Outlet } from '@tanstack/react-router';
import { AppSidebar } from './app-sidebar';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function AppLayout() {
    return (
        <AppSidebar>
            <Suspense
                fallback={
                    <div className='flex justify-center items-center w-full h-full'>
                        <Loader2 className='w-8 h-8 animate-spin text-primary' />
                    </div>
                }
            >
                <Outlet />
            </Suspense>
        </AppSidebar>
    );
}
