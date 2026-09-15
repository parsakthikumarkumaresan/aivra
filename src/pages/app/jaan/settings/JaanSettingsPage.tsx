import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Wallet, Plus, ExternalLink, Plug } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useBalance, useCreditTransactions } from '@/hooks/useJaan'
import { useAppData } from '@/app/AppDataProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { PillTabs } from '@/components/ui/Tabs'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label, Input, Switch } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import type { CreditTransactionType } from '@/types'
import { formatDateTime } from '@/utils/format'

const TX_TONE: Record<CreditTransactionType, BadgeTone> = { purchase: 'success', usage: 'neutral', refund: 'info', adjustment: 'warning' }

export default function JaanSettingsPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Settings' }])
  const { organization } = useAppData()
  const balance = useBalance()
  const transactions = useCreditTransactions()
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState(params.get('section') === 'billing' ? 'billing' : 'general')

  function changeTab(next: string) {
    setTab(next)
    const p = new URLSearchParams(params)
    p.set('section', next)
    setParams(p, { replace: true })
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-5 p-6">
      <PageHeader title="Jaan Settings" description="Voice defaults, billing and integrations for your Jaan Voice Workforce." />
      <PillTabs items={[{ value: 'general', label: 'General' }, { value: 'billing', label: 'Billing & Usage' }, { value: 'integrations', label: 'Integrations' }]} value={tab} onChange={changeTab} />

      {tab === 'general' && (
        <Card>
          <CardHeader title="Workspace" description="Jaan-level defaults for new agents." />
          <CardBody className="space-y-4">
            <div className="max-w-sm">
              <Label>Organization</Label>
              <Input value={organization?.name ?? ''} disabled />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-ink-200 p-3.5">
              <div>
                <p className="text-[13px] font-medium text-ink-800">Require human approval for high-risk transfers</p>
                <p className="text-xs text-ink-500">Applies to every new agent by default.</p>
              </div>
              <Switch checked onChange={() => {}} />
            </div>
            <p className="text-[12.5px] text-ink-500">
              Organization-wide members, roles and general settings live in{' '}
              <Link to="/app/settings" className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700">
                JEXA.AI Settings <ExternalLink className="size-3" />
              </Link>.
            </p>
          </CardBody>
        </Card>
      )}

      {tab === 'billing' && (
        <div className="space-y-5">
          <Card>
            <CardHeader title="Balance" actions={<Button size="sm" icon={<Plus className="size-3.5" />}>Add Credits</Button>} />
            <CardBody>
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Wallet className="size-5" /></span>
                <div>
                  <p className="text-[26px] font-bold leading-none text-ink-900">{balance.data ? `${balance.data.currency}${balance.data.amount.toFixed(2)}` : '—'}</p>
                  <p className="mt-1 text-[12.5px] text-ink-500">Auto-recharge {balance.data?.autoRechargeEnabled ? 'on' : 'off'} · Low balance alert at {balance.data ? `${balance.data.currency}${balance.data.lowBalanceThreshold}` : '—'}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Transaction History" />
            <div className="divide-y divide-ink-100">
              {(transactions.data ?? []).map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-ink-800">{t.description}</p>
                    <p className="text-xs text-ink-500">{formatDateTime(t.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Badge tone={TX_TONE[t.type]}>{t.type}</Badge>
                    <span className={`text-[13px] font-semibold ${t.amount < 0 ? 'text-ink-700' : 'text-success-600'}`}>{t.amount < 0 ? '-' : '+'}{t.currency}{Math.abs(t.amount).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <p className="text-[12.5px] text-ink-500">
            Your Jaan subscription plan and invoices are managed under{' '}
            <Link to="/app/settings" className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700">
              JEXA.AI Billing <ExternalLink className="size-3" />
            </Link>.
          </p>
        </div>
      )}

      {tab === 'integrations' && (
        <Card>
          <CardHeader title="Integrations" description="CRM, calendar, email and webhook connections available to your Jaan agents." />
          <CardBody>
            <p className="flex items-center gap-2 text-[13px] text-ink-600">
              <Plug className="size-4 text-brand-600" />
              Managed from the shared{' '}
              <Link to="/app/integrations" className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700">
                Integrations page <ExternalLink className="size-3" />
              </Link>{' '}
              — any integration connected there is available to Jaan's Tools.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
