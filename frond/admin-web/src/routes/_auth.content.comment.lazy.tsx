import { createLazyFileRoute } from '@tanstack/react-router'
import CommentList from '@/features/comment/comment-list'

export const Route = createLazyFileRoute('/_auth/content/comment')({
  component: CommentList,
})
