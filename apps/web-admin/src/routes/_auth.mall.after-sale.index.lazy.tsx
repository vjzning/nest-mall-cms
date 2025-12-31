import { createLazyFileRoute } from '@tanstack/react-router';
import AfterSaleList from '@/features/mall/after-sale/after-sale-list';

export const Route = createLazyFileRoute('/_auth/mall/after-sale/')({
  component: AfterSaleList,
});
