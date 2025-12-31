import { createLazyFileRoute } from '@tanstack/react-router';
import AfterSaleDetail from '@/features/mall/after-sale/after-sale-detail';

export const Route = createLazyFileRoute('/_auth/mall/after-sale/$id')({
  component: AfterSaleDetail,
});
