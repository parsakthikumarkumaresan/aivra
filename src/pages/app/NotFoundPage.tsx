import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { NotFoundContent } from '@/components/layout/NotFoundContent'

export default function NotFoundPage() {
  useSetBreadcrumbs([{ label: 'Not Found' }])
  return <NotFoundContent />
}
