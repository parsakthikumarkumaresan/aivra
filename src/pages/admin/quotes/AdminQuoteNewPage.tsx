import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calculator,
  Plus,
  Trash2,
  Sparkles,
  Building2,
  Check,
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import {
  adminOrganizationsService,
  adminService,
  quotesService,
} from '@/services/api'
import type {
  AdminOrganizationSummary,
  QuoteCalculatorInput,
  QuoteCalculationEstimate,
  QuoteLineItemCategory,
  QuoteLineItemInput,
} from '@/services/api'
import { CustomerSelector } from '@/components/admin/CustomerSelector'
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  CardBody,
} from '@/components/ui'
import { Input, Label, HelpText, Textarea } from '@/components/ui/Field'
import { formatCurrency } from '@/utils/format'
import { QUOTE_CATEGORY_LABEL } from './quoteStatusMeta'

export default function AdminQuoteNewPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { show } = useToast()

  const queryOrgId = searchParams.get('organizationId') || searchParams.get('org')
  const queryLeadId = searchParams.get('leadId')

  // Form State
  const [customer, setCustomer] = useState<AdminOrganizationSummary | null>(null)
  const [title, setTitle] = useState('Custom Jaan Voice Agent Solution')
  const [validDays, setValidDays] = useState(30)
  const [currency, setCurrency] = useState('INR')
  const [notes, setNotes] = useState(
    'Includes enterprise architecture design, workflow prompt engineering, and dedicated onboarding support.'
  )
  const [terms, setTerms] = useState(
    'Payment terms: 50% advance on approval, 50% upon customer acceptance. Platform and telephony charges billed monthly.'
  )

  // Calculator State & Configurable Heuristics
  const [calcInputs, setCalcInputs] = useState<QuoteCalculatorInput>({
    monthlyCalls: 1500,
    avgCallDurationMinutes: 2.5,
    languagesCount: 1,
    workflowComplexity: 'standard',
    integrationsCount: 1,
    customToolsCount: 0,
    knowledgeDocsCount: 10,
    telephonyNumbersCount: 1,
    supportTier: 'standard',
    currency: 'INR',
  })

  // Configurable baseline pricing parameters (Admin can customize or leave empty for heuristics)
  const [targetMinuteRate, setTargetMinuteRate] = useState<string>('')
  const [baseImplementationFee, setBaseImplementationFee] = useState<string>('')
  const [basePlatformMonthlyFee, setBasePlatformMonthlyFee] = useState<string>('')
  const [showPricingConfig, setShowPricingConfig] = useState<boolean>(false)

  const [estimate, setEstimate] = useState<QuoteCalculationEstimate | null>(null)
  const [calculating, setCalculating] = useState(false)

  // Line Items & Commercial Adjustments (Admin directly controls all deliverables & rates)
  const [lineItems, setLineItems] = useState<QuoteLineItemInput[]>([])
  const [discount, setDiscount] = useState<number>(0)
  const [taxRate, setTaxRate] = useState<number>(18.0)
  const [includedMinutes, setIncludedMinutes] = useState<number>(0)
  const [overageRate, setOverageRate] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)

  // Pre-fill from query params (e.g. Lead Detail -> Create Quote)
  useEffect(() => {
    if (queryOrgId) {
      adminOrganizationsService.get(queryOrgId).then((org) => {
        setCustomer({
          id: org.id,
          name: org.name,
          slug: org.slug,
          industry: org.industry,
          status: org.status,
          createdAt: org.createdAt,
          employeeProvisions: org.employeeProvisions,
        })
        setTitle(`Custom Jaan Solution — ${org.name}`)
      }).catch(() => {})
    }

    if (queryLeadId) {
      adminService.getLead(queryLeadId).then(async (lead) => {
        if (lead.companyName) {
          setTitle(`Custom Jaan Solution — ${lead.companyName}`)
        }
        if (lead.voiceProject) {
          try {
            const reqs = await adminService.listRequirements(lead.voiceProject.id)
            // Inspect collected discovery requirements to seed calculator inputs
            const languagesReq = reqs.find((r) => /language/i.test(r.key))
            const volumeReq = reqs.find((r) => /volume|call/i.test(r.key))
            const crmReq = reqs.find((r) => /crm|system|integration/i.test(r.key))

            setCalcInputs((prev) => ({
              ...prev,
              languagesCount: languagesReq?.value.includes(',')
                ? languagesReq.value.split(',').length
                : prev.languagesCount,
              monthlyCalls: volumeReq ? parseInt(volumeReq.value, 10) || prev.monthlyCalls : prev.monthlyCalls,
              integrationsCount: crmReq ? 2 : prev.integrationsCount,
            }))
          } catch {}
        }
      }).catch(() => {})
    }
  }, [queryOrgId, queryLeadId])

  // Run Calculator
  async function handleRunCalculator() {
    setCalculating(true)
    try {
      const payload: QuoteCalculatorInput = {
        ...calcInputs,
        targetMinuteRate: targetMinuteRate ? Number(targetMinuteRate) : null,
        baseImplementationFee: baseImplementationFee ? Number(baseImplementationFee) : null,
        basePlatformMonthlyFee: basePlatformMonthlyFee ? Number(basePlatformMonthlyFee) : null,
      }
      const res = await quotesService.calculate(payload)
      setEstimate(res)
      show({
        tone: 'success',
        title: 'Internal estimate calculated',
        description: `Projected setup: ₹${res.estimatedSetupFee.toLocaleString()} · Monthly: ₹${res.estimatedRecurringFee.toLocaleString()}`,
      })
    } catch {
      show({ tone: 'error', title: 'Could not calculate estimate' })
    } finally {
      setCalculating(false)
    }
  }

  function handleApplyEstimateToLineItems() {
    if (!estimate) return
    const items: QuoteLineItemInput[] = estimate.suggestedLineItems.map((s) => ({
      category: s.category,
      description: s.description,
      quantity: s.quantity,
      unit: s.unit,
      unitPrice: s.unitPrice,
    }))
    setLineItems(items)
    setIncludedMinutes(estimate.recommendedIncludedMinutes)
    setOverageRate(estimate.indicativeMinuteRate)
    show({
      tone: 'info',
      title: 'Estimate line items applied',
      description: 'You can now review, edit quantities, or adjust unit prices before saving.',
    })
  }

  // Add / Edit / Remove Line items
  function handleAddLineItem() {
    setLineItems((prev) => [
      ...prev,
      {
        category: 'development',
        description: 'Custom Service / Deliverable',
        quantity: 1,
        unit: 'unit',
        unitPrice: 0,
      },
    ])
  }

  function handleRemoveLineItem(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  }

  function handleUpdateLineItem(
    index: number,
    field: keyof QuoteLineItemInput,
    val: string | number
  ) {
    setLineItems((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: val }
      return copy
    })
  }

  // Commercial Math
  const subtotal = lineItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  )
  const effectiveDiscount = Math.min(subtotal, Math.max(0, Number(discount) || 0))
  const postDiscount = Math.max(0, subtotal - effectiveDiscount)
  const taxAmount = postDiscount * ((Number(taxRate) || 0) / 100)
  const total = postDiscount + taxAmount

  async function handleCreateQuote() {
    if (!customer) {
      show({ tone: 'error', title: 'Select a customer organization first' })
      return
    }
    if (!title.trim()) {
      show({ tone: 'error', title: 'Quote title is required' })
      return
    }
    if (lineItems.length === 0) {
      show({ tone: 'error', title: 'At least one line item is required' })
      return
    }

    setSubmitting(true)
    try {
      const validUntilDate = new Date()
      validUntilDate.setDate(validUntilDate.getDate() + validDays)

      const payload = {
        organizationId: customer.id,
        title: title.trim(),
        validUntil: validUntilDate.toISOString(),
        currency,
        leadId: queryLeadId || null,
        notes: notes.trim() || null,
        terms: terms.trim() || null,
        discount: effectiveDiscount,
        taxRate: Number(taxRate) || 0,
        includedVoiceMinutes: Number(includedMinutes) || 0,
        additionalMinuteRate: Number(overageRate) || 0,
        estimatedSetupFee: estimate?.estimatedSetupFee ?? null,
        estimatedRecurringFee: estimate?.estimatedRecurringFee ?? null,
        calculationSnapshot: estimate ? { ...estimate.calculationBreakdown } : null,
        lineItems: lineItems.map((i) => ({
          category: i.category,
          description: i.description,
          quantity: Number(i.quantity) || 1,
          unit: i.unit,
          unitPrice: Number(i.unitPrice) || 0,
        })),
      }

      const quote = await quotesService.create(payload)
      show({
        tone: 'success',
        title: 'Quote created successfully',
        description: `Reference: ${quote.quoteNumber}`,
      })
      navigate(`/admin/quotes/${quote.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not create quote'
      show({ tone: 'error', title: 'Quote creation failed', description: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <button
        type="button"
        onClick={() => navigate('/admin/quotes')}
        className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-800 transition-colors"
      >
        <ArrowLeft className="size-3.5" /> Back to Quotes
      </button>

      <PageHeader
        title="Create Internal Quotation"
        description="Configure requirements in the quote calculator, review estimates, and adjust commercial terms."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/quotes')}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              onClick={handleCreateQuote}
            >
              Save Draft Quote
            </Button>
          </div>
        }
      />

      {/* Top Customer Selection & Title Card */}
      <Card>
        <CardHeader
          title="Customer & Proposal Context"
          description="Link to an active organization from the Customer Directory."
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Customer Organization *</Label>
              <CustomerSelector
                value={customer}
                onChange={setCustomer}
                placeholder="Search organizations…"
              />
              {customer && (
                <div className="mt-2 flex items-center gap-2 text-[12px] text-ink-500">
                  <Building2 className="size-3.5 text-brand-600" />
                  <span>Selected: <strong className="text-ink-900">{customer.name}</strong> ({customer.id})</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="quote-title">Proposal Title *</Label>
              <Input
                id="quote-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Enterprise Voice AI Customization"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Internal Quote Calculator Card */}
      <Card className="border-brand-600/30 bg-surface">
        <CardHeader
          title="Internal Quote Calculator"
          description="Transparent estimation engine. Configurable parameters produce suggested baseline estimates for internal review."
          actions={
            <Button
              variant="primary"
              size="sm"
              icon={<Calculator className="size-3.5" />}
              loading={calculating}
              onClick={handleRunCalculator}
            >
              Run Calculator
            </Button>
          }
        />
        <CardBody className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="calc-calls">Expected Monthly Calls</Label>
              <Input
                id="calc-calls"
                type="number"
                value={calcInputs.monthlyCalls}
                onChange={(e) =>
                  setCalcInputs({ ...calcInputs, monthlyCalls: Number(e.target.value) || 0 })
                }
              />
              <HelpText>Average projected call volume</HelpText>
            </div>

            <div>
              <Label htmlFor="calc-duration">Avg Duration (Mins)</Label>
              <Input
                id="calc-duration"
                type="number"
                step="0.5"
                value={calcInputs.avgCallDurationMinutes}
                onChange={(e) =>
                  setCalcInputs({
                    ...calcInputs,
                    avgCallDurationMinutes: Number(e.target.value) || 1,
                  })
                }
              />
              <HelpText>Typical handle time per conversation</HelpText>
            </div>

            <div>
              <Label htmlFor="calc-langs">Languages Count</Label>
              <Input
                id="calc-langs"
                type="number"
                min="1"
                value={calcInputs.languagesCount}
                onChange={(e) =>
                  setCalcInputs({
                    ...calcInputs,
                    languagesCount: Number(e.target.value) || 1,
                  })
                }
              />
              <HelpText>e.g. English + Hindi / Regional</HelpText>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="calc-complexity">Workflow Complexity</Label>
              <select
                id="calc-complexity"
                value={calcInputs.workflowComplexity}
                onChange={(e) =>
                  setCalcInputs({ ...calcInputs, workflowComplexity: e.target.value })
                }
                className="h-9 w-full rounded-lg border border-ink-200 bg-surface px-3 text-[13px] text-ink-900 focus:border-brand-600 focus:outline-none"
              >
                <option value="standard">Standard (Linear QA / Inquiries)</option>
                <option value="advanced">Advanced (Multi-turn Branching / Forms)</option>
                <option value="enterprise">Enterprise (Complex State / Tool Calling)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="calc-integrations">External CRM/API Integrations</Label>
              <Input
                id="calc-integrations"
                type="number"
                min="0"
                value={calcInputs.integrationsCount}
                onChange={(e) =>
                  setCalcInputs({
                    ...calcInputs,
                    integrationsCount: Number(e.target.value) || 0,
                  })
                }
              />
              <HelpText>Salesforce, HubSpot, custom APIs</HelpText>
            </div>

            <div>
              <Label htmlFor="calc-support">Support & SLA Tier</Label>
              <select
                id="calc-support"
                value={calcInputs.supportTier}
                onChange={(e) =>
                  setCalcInputs({ ...calcInputs, supportTier: e.target.value })
                }
                className="h-9 w-full rounded-lg border border-ink-200 bg-surface px-3 text-[13px] text-ink-900 focus:border-brand-600 focus:outline-none"
              >
                <option value="standard">Standard SLA (Email / 24h)</option>
                <option value="priority">Priority SLA (Slack / 4h)</option>
                <option value="dedicated">Dedicated Engineer / 1h SLA</option>
              </select>
            </div>
          </div>

          {/* Configurable Commercial Baseline Pricing Rules */}
          <div className="rounded-xl border border-ink-200 bg-ink-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12.5px] font-semibold text-ink-800">
                  Commercial Baseline Rules & Overrides (Configurable Heuristics)
                </p>
                <p className="text-[11.5px] text-ink-500">
                  Separated from the calculation engine. Used ONLY to generate an internal estimate — Admin controls final quotes below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPricingConfig(!showPricingConfig)}
                className="text-[12px] font-medium text-brand-600 hover:text-brand-700 underline"
              >
                {showPricingConfig ? 'Hide Pricing Rules' : 'Configure Pricing Rules'}
              </button>
            </div>

            {showPricingConfig && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2 border-t border-ink-200/70">
                <div>
                  <Label htmlFor="cfg-minute-rate">Indicative Minute Rate (₹/min)</Label>
                  <Input
                    id="cfg-minute-rate"
                    type="number"
                    step="0.05"
                    placeholder="Auto volume-tiered"
                    value={targetMinuteRate}
                    onChange={(e) => setTargetMinuteRate(e.target.value)}
                  />
                  <HelpText>Custom rate override for voice credits</HelpText>
                </div>

                <div>
                  <Label htmlFor="cfg-impl-fee">Base Implementation Baseline (₹)</Label>
                  <Input
                    id="cfg-impl-fee"
                    type="number"
                    placeholder="Baseline default"
                    value={baseImplementationFee}
                    onChange={(e) => setBaseImplementationFee(e.target.value)}
                  />
                  <HelpText>Initial architecture & setup estimate</HelpText>
                </div>

                <div>
                  <Label htmlFor="cfg-platform-fee">Base Platform Monthly Baseline (₹)</Label>
                  <Input
                    id="cfg-platform-fee"
                    type="number"
                    placeholder="Baseline default"
                    value={basePlatformMonthlyFee}
                    onChange={(e) => setBasePlatformMonthlyFee(e.target.value)}
                  />
                  <HelpText>Monthly platform & maintenance estimate</HelpText>
                </div>
              </div>
            )}
          </div>

          {/* Calculator Output Banner */}
          {estimate && (
            <div className="rounded-xl border border-brand-600/30 bg-ink-50 p-4 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-brand-600 font-semibold text-[13.5px]">
                  <Sparkles className="size-4" />
                  <span>Internal Estimate Produced (Illustrative Only)</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Check className="size-3.5" />}
                  onClick={handleApplyEstimateToLineItems}
                >
                  Apply Suggested Items to Quote
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
                <div className="rounded-lg bg-surface p-3 border border-ink-200">
                  <p className="text-[11px] text-ink-500 font-medium">Estimated Setup</p>
                  <p className="text-lg font-bold text-ink-900">
                    {formatCurrency(estimate.estimatedSetupFee, 'INR')}
                  </p>
                </div>

                <div className="rounded-lg bg-surface p-3 border border-ink-200">
                  <p className="text-[11px] text-ink-500 font-medium">Monthly Platform</p>
                  <p className="text-lg font-bold text-ink-900">
                    {formatCurrency(estimate.estimatedRecurringFee, 'INR')}
                  </p>
                </div>

                <div className="rounded-lg bg-surface p-3 border border-ink-200">
                  <p className="text-[11px] text-ink-500 font-medium">Projected Minutes</p>
                  <p className="text-lg font-bold text-ink-900">
                    {estimate.estimatedTotalMonthlyMinutes.toLocaleString()} mins
                  </p>
                </div>

                <div className="rounded-lg bg-surface p-3 border border-ink-200">
                  <p className="text-[11px] text-ink-500 font-medium">Recommended Starter</p>
                  <p className="text-lg font-bold text-brand-600">
                    {estimate.recommendedIncludedMinutes.toLocaleString()} mins @ ₹{estimate.indicativeMinuteRate}/min
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-ink-400 italic">
                {estimate.disclaimer}
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Commercial Line Items Editor (Admin Control) */}
      <Card>
        <CardHeader
          title="Commercial Line Items & Overrides"
          description="Admin has full authority to edit quantities, unit prices, or append custom deliverables."
          actions={
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="size-3.5" />}
              onClick={handleAddLineItem}
            >
              Add Line Item
            </Button>
          }
        />
        <CardBody className="space-y-4">
          {lineItems.length === 0 ? (
            <div className="py-8 text-center rounded-xl border border-dashed border-ink-200 p-6 space-y-2 bg-ink-50/20">
              <Calculator className="size-7 text-ink-400 mx-auto mb-1" />
              <p className="text-[13.5px] font-semibold text-ink-800">No Commercial Line Items Added</p>
              <p className="text-[12px] text-ink-500 max-w-md mx-auto">
                Run the Internal Quote Calculator above and click <strong className="text-ink-700">"Apply Suggested Items to Quote"</strong> to populate baseline deliverables, or click below to enter deliverables manually.
              </p>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="size-3.5" />}
                onClick={handleAddLineItem}
                className="mt-2"
              >
                Add Line Item Manually
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-ink-200 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                    <th className="pb-2 w-36">Category</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2 w-24">Qty</th>
                    <th className="pb-2 w-24">Unit</th>
                    <th className="pb-2 w-32">Unit Price (₹)</th>
                    <th className="pb-2 w-32 text-right">Amount (₹)</th>
                    <th className="pb-2 w-10 text-center"></th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-ink-100">
                {lineItems.map((item, idx) => {
                  const itemAmount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
                  return (
                    <tr key={idx} className="group hover:bg-ink-50/50">
                      <td className="py-2.5 pr-2">
                        <select
                          value={item.category}
                          onChange={(e) =>
                            handleUpdateLineItem(
                              idx,
                              'category',
                              e.target.value as QuoteLineItemCategory
                            )
                          }
                          className="h-8 w-full rounded border border-ink-200 bg-surface px-2 text-[12px] text-ink-900 focus:border-brand-600 focus:outline-none"
                        >
                          {Object.entries(QUOTE_CATEGORY_LABEL).map(([cat, label]) => (
                            <option key={cat} value={cat}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 pr-2">
                        <input
                          value={item.description}
                          onChange={(e) =>
                            handleUpdateLineItem(idx, 'description', e.target.value)
                          }
                          className="h-8 w-full rounded border border-ink-200 bg-surface px-2.5 text-[12.5px] text-ink-900 focus:border-brand-600 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input
                          type="number"
                          step="any"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateLineItem(idx, 'quantity', e.target.value)
                          }
                          className="h-8 w-full rounded border border-ink-200 bg-surface px-2 text-[12.5px] text-ink-900 text-right focus:border-brand-600 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input
                          value={item.unit}
                          onChange={(e) =>
                            handleUpdateLineItem(idx, 'unit', e.target.value)
                          }
                          className="h-8 w-full rounded border border-ink-200 bg-surface px-2 text-[12px] text-ink-900 focus:border-brand-600 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 pr-2">
                        <input
                          type="number"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdateLineItem(idx, 'unitPrice', e.target.value)
                          }
                          className="h-8 w-full rounded border border-ink-200 bg-surface px-2 text-[12.5px] text-ink-900 text-right focus:border-brand-600 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 text-right font-semibold text-ink-900 pr-2">
                        ₹{itemAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="text-ink-400 hover:text-danger-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          )}

          {/* Totals & Adjustments Summary */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-t border-ink-200 pt-4 gap-6">
            <div className="w-full sm:max-w-md space-y-3">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">
                Voice Credits Allocation
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="inc-minutes">Included Minutes</Label>
                  <Input
                    id="inc-minutes"
                    type="number"
                    value={includedMinutes}
                    onChange={(e) => setIncludedMinutes(Number(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="overage-rate">Overage Rate (₹/min)</Label>
                  <Input
                    id="overage-rate"
                    type="number"
                    step="0.05"
                    value={overageRate}
                    onChange={(e) => setOverageRate(Number(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div className="w-full sm:w-80 rounded-xl bg-ink-50 p-4 border border-ink-200 space-y-2.5 text-[13px]">
              <div className="flex justify-between text-ink-600">
                <span>Subtotal</span>
                <span className="font-semibold text-ink-900">
                  {formatCurrency(subtotal, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-600">Admin Discount (₹)</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="h-7 w-28 rounded border border-ink-200 bg-surface px-2 text-right text-[12.5px] font-medium text-ink-900 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-ink-600">Tax Rate (%)</span>
                <input
                  type="number"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                  className="h-7 w-20 rounded border border-ink-200 bg-surface px-2 text-right text-[12.5px] font-medium text-ink-900 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-between text-ink-600">
                <span>Tax Amount</span>
                <span>{formatCurrency(taxAmount, currency)}</span>
              </div>

              <div className="border-t border-ink-200 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-ink-900">Final Quoted Total</span>
                <span className="text-xl font-bold text-brand-600">
                  {formatCurrency(total, currency)}
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Terms & Validity Card */}
      <Card>
        <CardHeader
          title="Terms & Notes"
          description="Visible on the customer proposal document."
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="q-validity">Validity Period (Days from creation)</Label>
              <Input
                id="q-validity"
                type="number"
                value={validDays}
                onChange={(e) => setValidDays(Number(e.target.value) || 30)}
              />
            </div>
            <div>
              <Label htmlFor="q-currency">Currency Code</Label>
              <Input
                id="q-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                maxLength={3}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="q-notes">Commercial Notes</Label>
            <Textarea
              id="q-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="q-terms">Commercial Terms & Conditions</Label>
            <Textarea
              id="q-terms"
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Bottom Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/admin/quotes')}>
          Cancel
        </Button>
        <Button variant="primary" loading={submitting} onClick={handleCreateQuote}>
          Save Draft Quote
        </Button>
      </div>
    </div>
  )
}
