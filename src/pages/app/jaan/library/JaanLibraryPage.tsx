import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Plus } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useKnowledgeSources } from '@/hooks/useKnowledge'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { KnowledgeSourceCard } from '@/components/knowledge/KnowledgeSourceCard'

// Jaan's Library is Company Brain content scoped to voice — the knowledge
// base is genuinely shared across AI Employees, so this reuses the same
// source of truth rather than forking a parallel document store.
export default function JaanLibraryPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Library' }])
  const navigate = useNavigate()
  const sources = useKnowledgeSources()
  const [search, setSearch] = useState('')

  const voiceSources = (sources.data ?? []).filter((s) => s.employeeAccess.includes('voice') && (!search || s.name.toLowerCase().includes(search.toLowerCase())))

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-6">
      <PageHeader
        title="Library"
        description="Documents, URLs and knowledge articles Jaan can search during a call."
        actions={<Button icon={<Plus className="size-3.5" />} onClick={() => navigate('/app/knowledge')}>Add Source</Button>}
      />
      <SearchInput value={search} onChange={setSearch} placeholder="Search library…" containerClassName="w-64" />

      {sources.loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : voiceSources.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-6" />}
          title="No library sources yet"
          description="Upload knowledge so Jaan can answer business-specific questions."
          action={<Button icon={<Plus className="size-4" />} onClick={() => navigate('/app/knowledge')}>Add Source</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {voiceSources.map((s) => (
            <KnowledgeSourceCard key={s.id} source={s} onClick={() => navigate('/app/knowledge')} />
          ))}
        </div>
      )}
    </div>
  )
}
