import { lazy } from 'react';

// Map database component strings to React components
export const COMPONENT_MAP: Record<string, React.LazyExoticComponent<any>> = {
  'user/user-list': lazy(() => import('@/features/user/user-list')),
  'role/role-list': lazy(() => import('@/features/role/role-list')),
  'menu/menu-list': lazy(() => import('@/features/menu/menu-list')),
  'article/article-list': lazy(() => import('@/features/article/article-list')),
  'category/category-list': lazy(() => import('@/features/category/category-list')),
  'tag/tag-list': lazy(() => import('@/features/tag/tag-list')),
  'comment/comment-list': lazy(() => import('@/features/comment/comment-list')),
};
