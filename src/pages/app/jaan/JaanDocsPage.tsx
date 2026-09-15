import { BookOpen, ExternalLink, MessagesSquare, Wrench, Workflow } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'

const DOC_LINKS = [
  { icon: MessagesSquare, title: 'Getting Started with Jaan', description: 'Create your first agent, choose a voice and go live.' },
  { icon: Wrench, title: 'Tools & Integrations', description: 'Connect APIs, CRMs and webhooks so Jaan can take action.' },
  { icon: Workflow, title: 'Flow Builder Guide', description: 'Design multi-step conversation flows with branches and conditions.' },
  { icon: BookOpen, title: 'API Reference', description: 'Full reference for the JEXA.AI Voice API.' },
]

// Placeholder entry point — links out to the real JEXA.AI documentation site
// once it exists. Kept as a real page (not a bare redirect) so it can host
// quick-reference cards in the meantime.
export default function JaanDocsPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Docs' }])

  return (
    <div className="mx-auto max-w-[900px] space-y-5 p-6">
      <PageHeader title="Docs" description="Guides and references for building on Jaan." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DOC_LINKS.map((d) => (
          <Card key={d.title} className="transition-colors duration-150 hover:border-brand-600/50">
            <CardBody className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><d.icon className="size-4.5" /></span>
              <div>
                <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-900">{d.title} <ExternalLink className="size-3 text-ink-400" /></p>
                <p className="mt-0.5 text-[12.5px] text-ink-500">{d.description}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
