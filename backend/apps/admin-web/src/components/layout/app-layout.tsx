import { Outlet } from '@tanstack/react-router';
import { AppSidebar } from './app-sidebar';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

export default function AppLayout() {
  return (
    <AppSidebar>
        <div className="absolute top-4 right-4 z-10">
            <ModeToggle />
        </div>
      <Suspense fallback={
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <Outlet />
      </Suspense>
    </AppSidebar>
  );
}
