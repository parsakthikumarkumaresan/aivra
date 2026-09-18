import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Wallet, Plus, Package } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { useToast } from '@/hooks/useToast'
import { adminCreditsService, adminOrganizationsService } from '@/services/api'
import type { VoiceCreditTransaction, VoiceCreditTransactionType, RechargePackage, AdminOrganizationSummary } from '@/services/api'
import { isApiError } from '@/services/api/errors'
import { PageHeader, Badge, DataTable, ErrorState, EmptyState, Modal, Button, Card, CardHeader } from '@/components/ui'
import type { BadgeTone } from '@/components/ui/Badge'
import { CustomerSelector } from '@/components/admin/CustomerSelector'
import { Input, Label, Select, Switch, Textarea, HelpText } from '@/components/ui/Field'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatDateTime } from '@/utils/format'

const TX_TONE: Record<VoiceCreditTransactionType, BadgeTone> = {
  initial_allocation: 'success',
  recharge: 'success',
  complimentary: 'success',
  usage_debit: 'neutral',
  admin_adjustment: 'warning',
  refund: 'info',
}

const ADJUSTMENT_TYPES: { value: VoiceCreditTransactionType; label: string; signHint: string }[] = [
  { value: 'complimentary', label: 'Complimentary', signHint: 'adds minutes' },
  { value: 'recharge', label: 'Customer Recharge (manual record)', signHint: 'adds minutes' },
  { value: 'initial_allocation', label: 'Initial Allocation', signHint: 'adds minutes' },
  { value: 'admin_adjustment', label: 'Correction', signHint: 'positive or negative' },
  { value: 'refund', label: 'Refund', signHint: 'removes minutes' },
]

// Admin credit management (spec section 22) — the customer is chosen via
// the real Customer Directory (CustomerSelector), and Customer Detail's
// "Manage Credits" link can deep-link here via ?org=.
export default function AdminCreditsPage() {
  const [params] = useSearchParams()
  const deepLinkOrgId = params.get('org')

  const [selected, setSelected] = useState<AdminOrganizationSummary | null>(null)
  const deepLinked = useAsync(
    () => (deepLinkOrgId ? adminOrganizationsService.get(deepLinkOrgId) : Promise.resolve(null)),
    [deepLinkOrgId],
  )
  useEffect(() => {
    if (deepLinked.data) setSelected(deepLinked.data)
  }, [deepLinked.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jaan Voice Credits"
        description="Search for a customer to view its Jaan Voice Credit balance, transaction history, and make adjustments (real backend, platform-role gated)."
      />

      <CustomerSelector value={selected} onChange={setSelected} className="max-w-md" />

      {!selected ? (
        <EmptyState icon={<Wallet className="size-5" />} title="Select a customer" description="Search for a customer above to manage their Jaan Voice Credits." compact />
      ) : (
        <OrganizationCredits organizationId={selected.id} />
      )}

      <RechargePackagesCard />
    </div>
  )
}

function OrganizationCredits({ organizationId }: { organizationId: string }) {
  const summary = useAsync(() => adminCreditsService.getOrganizationCredits(organizationId), [organizationId])
  const transactions = useAsync(
    () => adminCreditsService.listOrganizationTransactions(organizationId),
    [organizationId],
  )
  const [adjustOpen, setAdjustOpen] = useState(false)

  if (summary.error) {
    return <ErrorState title="Organization not found" onRetry={summary.refetch} />
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <SummaryTile label="Current Balance" value={summary.data ? `${summary.data.balanceMinutes} min` : '—'} />
        <SummaryTile label="Purchased" value={summary.data ? `${summary.data.purchasedMinutes} min` : '—'} />
        <SummaryTile label="Used" value={summary.data ? `${summary.data.usedMinutes} min` : '—'} />
        <SummaryTile
          label="Last Recharge"
          value={summary.data?.lastRechargeAt ? formatDateTime(summary.data.lastRechargeAt) : 'Never'}
        />
      </div>

      {summary.data && summary.data.purchasedMinutes > 0 && (
        <div className="rounded-xl border border-ink-200 bg-surface p-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-ink-500">Usage</span>
            <span className="font-medium text-ink-800">{summary.data.usagePercent}%</span>
          </div>
          <ProgressBar value={summary.data.usagePercent} className="mt-2" tone={summary.data.usagePercent > 90 ? 'danger' : 'brand'} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-ink-900">Transaction History</h2>
        <Button size="sm" icon={<Plus className="size-3.5" />} onClick={() => setAdjustOpen(true)}>
          Add Credits
        </Button>
      </div>

      <DataTable
        columns={[
          {
            key: 'type',
            header: 'Type',
            render: (t: VoiceCreditTransaction) => <Badge tone={TX_TONE[t.type]}>{t.type.replace('_', ' ')}</Badge>,
          },
          {
            key: 'minutes',
            header: 'Minutes',
            render: (t: VoiceCreditTransaction) => (
              <span className={t.minutes < 0 ? 'text-ink-700' : 'font-semibold text-success-600'}>
                {t.minutes > 0 ? '+' : ''}
                {t.minutes}
              </span>
            ),
          },
          { key: 'reason', header: 'Reason', render: (t: VoiceCreditTransaction) => t.reason ?? '—' },
          { key: 'actor', header: 'Added By', render: (t: VoiceCreditTransaction) => t.createdByUserId ?? 'System' },
          { key: 'createdAt', header: 'Date', render: (t: VoiceCreditTransaction) => formatDateTime(t.createdAt) },
        ]}
        data={transactions.data ?? []}
        keyExtractor={(t) => t.id}
        loading={transactions.loading}
        emptyState={<EmptyState icon={<Wallet className="size-5" />} title="No transactions yet" compact />}
      />

      <AdjustCreditsModal
        open={adjustOpen}
        organizationId={organizationId}
        onClose={() => setAdjustOpen(false)}
        onAdjusted={() => {
          summary.refetch()
          transactions.refetch()
        }}
      />
    </div>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-surface p-4">
      <p className="text-[12px] font-medium text-ink-500">{label}</p>
      <p className="mt-1 text-[20px] font-bold text-ink-900">{value}</p>
    </div>
  )
}

function AdjustCreditsModal({
  open,
  organizationId,
  onClose,
  onAdjusted,
}: {
  open: boolean
  organizationId: string
  onClose: () => void
  onAdjusted: () => void
}) {
  const { show } = useToast()
  const [type, setType] = useState<VoiceCreditTransactionType>('complimentary')
  const [minutes, setMinutes] = useState('')
  const [reason, setReason] = useState('')
  const [reference, setReference] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    const parsed = Number(minutes)
    if (!Number.isFinite(parsed) || parsed === 0) {
      setError('Enter a non-zero number of minutes.')
      return
    }
    if (!reason.trim()) {
      setError('A reason is required for every adjustment.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await adminCreditsService.adjustOrganizationCredits(organizationId, {
        type,
        minutes: parsed,
        reason: reason.trim(),
        reference: reference.trim() || undefined,
      })
      show({ tone: 'success', title: 'Credits adjusted', description: `${parsed > 0 ? '+' : ''}${parsed} minutes recorded.` })
      setMinutes('')
      setReason('')
      setReference('')
      onAdjusted()
      onClose()
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Could not adjust credits.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Credits" description={`Organization ${organizationId}`}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="adj-type">Type</Label>
          <Select id="adj-type" value={type} onChange={(e) => setType(e.target.value as VoiceCreditTransactionType)}>
            {ADJUSTMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label} ({t.signHint})
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="adj-minutes" required>
            Minutes
          </Label>
          <Input
            id="adj-minutes"
            type="number"
            placeholder={type === 'refund' ? 'e.g. -100' : 'e.g. 500'}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="adj-reason" required>
            Reason
          </Label>
          <Textarea id="adj-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
        </div>
        <div>
          <Label htmlFor="adj-reference">Payment/reference (optional)</Label>
          <Input id="adj-reference" value={reference} onChange={(e) => setReference(e.target.value)} />
        </div>
        {error && <HelpText error>{error}</HelpText>}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button loading={submitting} onClick={handleSubmit}>
          Confirm
        </Button>
      </div>
    </Modal>
  )
}

function RechargePackagesCard() {
  const packages = useAsync(() => adminCreditsService.listAllRechargePackages(), [])
  const { show } = useToast()
  const [createOpen, setCreateOpen] = useState(false)

  async function toggleActive(pkg: RechargePackage) {
    try {
      await adminCreditsService.updateRechargePackage(pkg.id, { isActive: !pkg.isActive })
      packages.refetch()
    } catch (err) {
      show({ tone: 'error', title: 'Could not update package', description: isApiError(err) ? err.message : undefined })
    }
  }

  return (
    <Card>
      <CardHeader
        title="Recharge Packages"
        description="Customer-facing pricing (spec: never hardcoded in the frontend) — configured here."
        actions={
          <Button size="sm" variant="outline" icon={<Plus className="size-3.5" />} onClick={() => setCreateOpen(true)}>
            New Package
          </Button>
        }
      />
      <DataTable
        columns={[
          { key: 'label', header: 'Package', render: (p: RechargePackage) => <span className="font-medium text-ink-900">{p.label}</span> },
          { key: 'minutes', header: 'Minutes', render: (p: RechargePackage) => String(p.minutes) },
          { key: 'amount', header: 'Price', render: (p: RechargePackage) => `${p.currency} ${p.amount.toFixed(2)}` },
          {
            key: 'active',
            header: 'Active',
            render: (p: RechargePackage) => <Switch checked={p.isActive} onChange={() => toggleActive(p)} />,
          },
        ]}
        data={packages.data ?? []}
        keyExtractor={(p) => p.id}
        loading={packages.loading}
        emptyState={<EmptyState icon={<Package className="size-5" />} title="No packages configured" compact />}
        className="border-0 border-t border-ink-100 rounded-t-none"
      />
      <CreatePackageModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={packages.refetch} />
    </Card>
  )
}

function CreatePackageModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { show } = useToast()
  const [label, setLabel] = useState('')
  const [minutes, setMinutes] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    const parsedMinutes = Number(minutes)
    const parsedAmount = Number(amount)
    if (!label.trim() || !Number.isFinite(parsedMinutes) || parsedMinutes <= 0 || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a label, positive minutes, and a positive price.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await adminCreditsService.createRechargePackage({ label: label.trim(), minutes: parsedMinutes, amount: parsedAmount, currency })
      show({ tone: 'success', title: 'Package created', description: label })
      setLabel('')
      setMinutes('')
      setAmount('')
      onCreated()
      onClose()
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Could not create package.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Recharge Package">
      <div className="space-y-4">
        <div>
          <Label htmlFor="pkg-label" required>
            Label
          </Label>
          <Input id="pkg-label" placeholder="e.g. Growth" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="pkg-minutes" required>
              Minutes
            </Label>
            <Input id="pkg-minutes" type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pkg-amount" required>
              Price
            </Label>
            <Input id="pkg-amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>
        <div className="max-w-[120px]">
          <Label htmlFor="pkg-currency">Currency</Label>
          <Select id="pkg-currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD</option>
            <option value="INR">INR</option>
            <option value="EUR">EUR</option>
          </Select>
        </div>
        {error && <HelpText error>{error}</HelpText>}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button loading={submitting} onClick={handleSubmit}>
          Create
        </Button>
      </div>
    </Modal>
  )
}
