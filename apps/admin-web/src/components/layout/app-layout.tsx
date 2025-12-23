import { Outlet } from 'react-router-dom';
import { AppSidebar } from './app-sidebar';

export default function AppLayout() {
  return (
    <AppSidebar>
      <Outlet />
    </AppSidebar>
  );
}
