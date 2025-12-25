import { createLazyFileRoute } from '@tanstack/react-router'
import ArticleList from '@/features/article/article-list'

export const Route = createLazyFileRoute('/_auth/content/article')({
  component: ArticleList,
})
