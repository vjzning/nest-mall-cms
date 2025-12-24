import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth.store'
import { menuApi } from '@/features/menu/api'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ location }) => {
    const token = useAuthStore.getState().token
    if (!token) {
      throw redirect({
        to: '/login',
        search: {
          // @ts-ignore
          redirect: location.href,
        },
      })
    }

    // Check permission logic
    // We need to fetch user menus to verify if the user has access to the current route
    try {
      // Basic optimization: Only check for specific routes, skip for root/dashboard
      if (location.pathname === '/' || location.pathname === '') {
        return
      }
      
      const menus = await menuApi.getMyMenus();
      const hasPermission = menus.some(menu => {
        // Simple check: if menu.path matches current path
        // Note: this might need more sophisticated matching for nested routes or params
        // Also need to handle leading slashes consistency
        const menuPath = menu.path?.startsWith('/') ? menu.path : `/${menu.path}`;
        return location.pathname === menuPath || location.pathname.startsWith(`${menuPath}/`);
      });

      // If fetches successfully but no matching menu found for this route
      // We might want to be careful not to block valid routes that aren't in the menu (like profile, etc.)
      // For now, let's just log or maybe restrict strictly if required.
      // But typically, backend guards handle data access. Frontend hiding is UX.
      // If we want strict 403 redirect:
      /* 
      if (!hasPermission) {
         throw redirect({ to: '/403' })
      } 
      */
    } catch (error) {
       // Handle error (e.g. token expired during check)
    }
  },
})
