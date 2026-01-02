import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

const MallCategoryList = lazy(() => import('@/features/mall/category/category-list'));

export const Route = createFileRoute('/_auth/mall/category/')({
  component: () => <MallCategoryList />,
});
