import { createLazyFileRoute } from '@tanstack/react-router';
import FlashSaleList from '@/features/mall/flash-sale';

export const Route = createLazyFileRoute('/_auth/mall/flash-sale/')({
    component: FlashSaleList,
});
