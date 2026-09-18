import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Wallet, Plus, ExternalLink, Plug, Receipt, Check } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useCreditBalance, useCreditTransactions, useRechargePackages } from '@/hooks/useJaan'
import { useAppData } from '@/app/AppDataProvider'
import { useToast } from '@/hooks/useToast'
import { creditsService } from '@/services/api'
import type { VoiceCreditTransactionType } from '@/services/api'
import { isApiError } from '@/services/api/errors'
import { PageHeader } from '@/components/ui/PageHeader'
import { PillTabs } from '@/components/ui/Tabs'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Label, Input, Switch } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDateTime } from '@/utils/format'

const TX_TONE: Record<VoiceCreditTransactionType, BadgeTone> = {
  initial_allocation: 'success',
  recharge: 'success',
  complimentary: 'success',
  usage_debit: 'neutral',
  admin_adjustment: 'warning',
  refund: 'info',
}
const TX_LABEL: Record<VoiceCreditTransactionType, string> = {
  initial_allocation: 'Initial Allocation',
  recharge: 'Recharge',
  complimentary: 'Complimentary',
  usage_debit: 'Voice Call',
  admin_adjustment: 'Adjustment',
  refund: 'Refund',
}

export default function JaanSettingsPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Settings' }])
  const { organization } = useAppData()
  const balance = useCreditBalance()
  const transactions = useCreditTransactions()
  const [rechargeOpen, setRechargeOpen] = useState(false)
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
            <CardHeader
              title="Voice Minutes"
              actions={
                <Button size="sm" icon={<Plus className="size-3.5" />} onClick={() => setRechargeOpen(true)}>
                  Recharge Credits
                </Button>
              }
            />
            <CardBody className="space-y-4">
              {balance.loading ? (
                <Skeleton className="h-16 w-full" />
              ) : balance.error ? (
                <ErrorState compact onRetry={balance.refetch} />
              ) : balance.data ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Wallet className="size-5" />
                    </span>
                    <div>
                      <p className="text-[26px] font-bold leading-none text-ink-900">
                        {balance.data.usedMinutes} / {balance.data.purchasedMinutes || balance.data.usedMinutes} minutes
                      </p>
                      <p className={`mt-1 text-[12.5px] ${balance.data.lowBalance ? 'font-medium text-danger-600' : 'text-ink-500'}`}>
                        {balance.data.balanceMinutes} minutes remaining
                        {balance.data.lowBalance && ' — balance is low'}
                      </p>
                    </div>
                  </div>
                  {balance.data.purchasedMinutes > 0 && (
                    <ProgressBar
                      value={(balance.data.usedMinutes / balance.data.purchasedMinutes) * 100}
                      tone={balance.data.lowBalance ? 'danger' : 'brand'}
                    />
                  )}
                  <p className="text-[12px] text-ink-500">
                    {balance.data.lastRechargeAt
                      ? `Last recharge ${formatDateTime(balance.data.lastRechargeAt)}`
                      : 'No recharges yet.'}
                  </p>
                </>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Transaction History" />
            {transactions.loading ? (
              <CardBody>
                <Skeleton className="h-24 w-full" />
              </CardBody>
            ) : transactions.data && transactions.data.length === 0 ? (
              <CardBody>
                <EmptyState compact icon={<Receipt className="size-6" />} title="No transactions yet" description="Recharges and voice-call usage will show up here." />
              </CardBody>
            ) : (
              <div className="divide-y divide-ink-100">
                {(transactions.data ?? []).map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-ink-800">{t.reason ?? TX_LABEL[t.type]}</p>
                      <p className="text-xs text-ink-500">{formatDateTime(t.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Badge tone={TX_TONE[t.type]}>{TX_LABEL[t.type]}</Badge>
                      <span className={`text-[13px] font-semibold ${t.minutes < 0 ? 'text-ink-700' : 'text-success-600'}`}>
                        {t.minutes < 0 ? '' : '+'}
                        {t.minutes} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <p className="text-[12.5px] text-ink-500">
            Your Jaan subscription plan and invoices are managed under{' '}
            <Link to="/app/settings" className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700">
              JEXA.AI Billing <ExternalLink className="size-3" />
            </Link>.
          </p>

          <RechargeModal open={rechargeOpen} onClose={() => setRechargeOpen(false)} />
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

function RechargeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const packages = useRechargePackages()
  const { show } = useToast()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    if (!selectedId) return
    setSubmitting(true)
    try {
      const order = await creditsService.createRecharge(selectedId)
      if (order.checkoutUrl) {
        // Real Stripe Checkout redirect — never mark credits as purchased
        // client-side; the ledger only updates once Stripe's webhook
        // confirms payment server-side.
        window.location.href = order.checkoutUrl
        return
      }
      show({ tone: 'error', title: 'Could not start checkout', description: 'No checkout URL was returned.' })
    } catch (err) {
      show({ tone: 'error', title: 'Recharge failed', description: isApiError(err) ? err.message : 'Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Recharge Jaan Voice Credits" description="Choose a package — you'll complete payment securely via Stripe.">
      {packages.loading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : packages.error ? (
        <ErrorState compact onRetry={packages.refetch} />
      ) : packages.data && packages.data.length === 0 ? (
        <EmptyState compact icon={<Wallet className="size-6" />} title="No recharge packages available" description="Ask your JEXA.AI account team to configure Jaan Voice Credit packages." />
      ) : (
        <div className="space-y-2">
          {(packages.data ?? []).map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors duration-150 ${
                selectedId === p.id ? 'border-brand-600 bg-brand-50/40' : 'border-ink-200 hover:border-ink-300'
              }`}
            >
              <div>
                <p className="text-[13.5px] font-semibold text-ink-900">{p.label}</p>
                <p className="text-xs text-ink-500">{p.minutes} minutes</p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[15px] font-bold text-ink-900">
                  {p.currency} {p.amount.toFixed(2)}
                </span>
                {selectedId === p.id && <Check className="size-4 text-brand-600" />}
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!selectedId} loading={submitting} onClick={handleConfirm}>
          Continue to payment
        </Button>
      </div>
    </Modal>
  )
}
