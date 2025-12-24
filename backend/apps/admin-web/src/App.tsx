import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from './stores/auth.store';
import { Suspense, lazy, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { menuApi, type Menu } from './features/menu/api';
import { COMPONENT_MAP } from './router/component-map';

const LoginPage = lazy(() => import('./features/auth/login-page'));
const AppLayout = lazy(() => import('./components/layout/app-layout'));

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function AppRoutes() {
  const token = useAuthStore((state) => state.token);
  
  const { data: menus } = useQuery({
    queryKey: ['my-menus'],
    queryFn: menuApi.getMyMenus,
    enabled: !!token, // Only fetch if logged in
  });

  const dynamicRoutes = useMemo(() => {
    if (!menus) return [];

    const routes: React.ReactNode[] = [];
    const processedPaths = new Set<string>();

    const processMenu = (menu: Menu) => {
      if (menu.path && menu.component && COMPONENT_MAP[menu.component] && !processedPaths.has(menu.path)) {
        const Component = COMPONENT_MAP[menu.component];
        // Remove leading slash for nested routes if needed, 
        // but since we are under "/", absolute paths like "/system/user" might need adjustment 
        // or Route path can handle "system/user" (relative) vs "/system/user" (absolute).
        // React Router v6 nested routes are relative. 
        // If our paths are absolute "/system/user", we should strip the leading slash.
        const path = menu.path.startsWith('/') ? menu.path.slice(1) : menu.path;
        
        routes.push(
          <Route 
            key={menu.id} 
            path={path} 
            element={<Component />} 
          />
        );
        processedPaths.add(menu.path);
      }
      
      if (menu.children) {
        menu.children.forEach(processMenu);
      }
    };

    menus.forEach(processMenu);
    return routes;
  }, [menus]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<div>Dashboard Home</div>} />
          {dynamicRoutes}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </Suspense>
  );
}

import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
