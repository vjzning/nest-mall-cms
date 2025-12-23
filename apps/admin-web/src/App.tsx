import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/auth.store';
import LoginPage from './features/auth/login-page';
import AppLayout from './components/layout/app-layout';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
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
            <Route path="articles" element={<div>Articles Module (Todo)</div>} />
            <Route path="categories" element={<div>Categories Module (Todo)</div>} />
            <Route path="tags" element={<div>Tags Module (Todo)</div>} />
            <Route path="users" element={<div>Users Module (Todo)</div>} />
            <Route path="roles" element={<div>Roles Module (Todo)</div>} />
            <Route path="menus" element={<div>Menus Module (Todo)</div>} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
