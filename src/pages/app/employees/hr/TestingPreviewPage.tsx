import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FlaskConical, Target, Play } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useAsync } from '@/hooks/useAsync'
import { useJobs } from '@/hooks/useHr'
import { hrService } from '@/services/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, Label } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ResumeAnalysisCard } from '@/components/employees/hr/ResumeAnalysisCard'
import { JdMatchCard } from '@/components/employees/hr/JdMatchCard'
import type { ExtractedResumeProfile, JdMatchBreakdown } from '@/types'

export default function TestingPreviewPage() {
  useSetBreadcrumbs([{ label: 'AI Employees', href: '/app/employees' }, { label: 'AI HR Employee', href: '/app/employees/hr' }, { label: 'Configuration', href: '/app/employees/hr/configuration' }, { label: 'Testing & Preview' }])
  const jobs = useJobs()
  const samples = useAsync(() => hrService.listResumeSamples(), [])

  const [sampleIndex, setSampleIndex] = useState('0')
  const [jobId, setJobId] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<{ profile: ExtractedResumeProfile; match: JdMatchBreakdown } | null>(null)

  async function runTest() {
    if (!jobId) return
    setRunning(true)
    setResult(null)
    const outcome = await hrService.previewResumeMatch(Number(sampleIndex), jobId)
    setRunning(false)
    if (outcome) setResult(outcome)
  }

  return (
    <div className="space-y-5">
      <Link to="/app/employees/hr/configuration" className="flex items-center gap-1.5 text-[13px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-3.5" />
        Back to Configuration
      </Link>

      <PageHeader icon={<FlaskConical className="size-5" />} title="Testing & Preview" description="Try resume parsing and candidate matching against a sample resume — no real candidates are affected." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Resume Parsing & Matching Test" description="See extraction and JD matching for a sample resume" />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label>Sample resume</Label>
                {samples.loading ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Select value={sampleIndex} onChange={(e) => setSampleIndex(e.target.value)}>
                    {samples.data?.map((s) => (
                      <option key={s.index} value={s.index}>{s.label}</option>
                    ))}
                  </Select>
                )}
              </div>
              <div>
                <Label>Job</Label>
                <Select value={jobId} onChange={(e) => setJobId(e.target.value)}>
                  <option value="">Select a job…</option>
                  {jobs.data?.map((j) => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </Select>
              </div>
            </div>
            <Button icon={<Play className="size-4" />} onClick={runTest} loading={running} disabled={!jobId}>
              Run Test
            </Button>
          </CardBody>
        </Card>
      </div>

      {running && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      )}

      {!running && result && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ResumeAnalysisCard profile={result.profile} />
          <JdMatchCard match={result.match} jobTitle={jobs.data?.find((j) => j.id === jobId)?.title ?? 'this role'} />
        </div>
      )}

      {!running && !result && (
        <EmptyState
          icon={<Target className="size-6" />}
          title="Run a test to see results"
          description="Choose a sample resume and job above, then run the test to preview resume parsing and JD matching."
        />
      )}
    </div>
  )
}
