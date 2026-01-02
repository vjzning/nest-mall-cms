import { createLazyFileRoute } from '@tanstack/react-router';
import MemberList from '@/features/mall/member/member-list';

export const Route = createLazyFileRoute('/_auth/mall/member')({
  component: MemberList,
});
