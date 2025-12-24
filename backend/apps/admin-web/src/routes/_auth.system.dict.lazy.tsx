import { createLazyFileRoute } from '@tanstack/react-router'
import DictionaryPage from '@/features/dictionary'

export const Route = createLazyFileRoute('/_auth/system/dict')({
  component: DictionaryPage,
})
