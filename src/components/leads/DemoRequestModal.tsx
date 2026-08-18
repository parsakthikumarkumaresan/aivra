import { useEffect, useState } from 'react'
import { CheckCircle2, Sparkles } from 'lucide-react'
import type { DemoLeadInput, EmployeeType } from '@/types'
import { leadsService } from '@/services/api'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Field'

const EMPLOYEE_LABEL: Record<EmployeeType, string> = { hr: 'AI HR Employee', voice: 'AI Voice Employee' }

const EMPTY: Omit<DemoLeadInput, 'interestedIn'> = {
  fullName: '',
  companyName: '',
  businessEmail: '',
  phoneNumber: '',
  industry: '',
  companyWebsite: '',
  companySize: '',
  additionalRequirements: '',
}

interface DemoRequestModalProps {
  employeeType: EmployeeType | null
  onClose: () => void
}

export function DemoRequestModal({ employeeType, onClose }: DemoRequestModalProps) {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const open = Boolean(employeeType)

  useEffect(() => {
    if (open) {
      setForm(EMPTY)
      setSubmitted(false)
    }
  }, [open])

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const canSubmit = form.fullName.trim() && form.companyName.trim() && form.businessEmail.trim() && form.phoneNumber.trim() && form.industry.trim()

  async function submit() {
    if (!employeeType || !canSubmit) return
    setSubmitting(true)
    await leadsService.submitDemoRequest({ ...form, interestedIn: employeeType })
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <Modal open={open} onClose={onClose} size="md" title={submitted ? undefined : 'Request a Demo'} description={submitted ? undefined : employeeType ? `Interested in: ${EMPLOYEE_LABEL[employeeType]}` : undefined}>
      {submitted ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-success-100 text-success-600">
            <CheckCircle2 className="size-7" />
          </div>
          <p className="text-[17px] font-semibold text-ink-900">✓ Demo request received</p>
          <p className="max-w-sm text-[13px] text-ink-500">Our team will contact you shortly.</p>
          <Button className="mt-2" variant="outline" onClick={onClose}>Close</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Full Name</Label>
              <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
            </div>
            <div>
              <Label required>Company Name</Label>
              <Input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Business Email</Label>
              <Input type="email" value={form.businessEmail} onChange={(e) => set('businessEmail', e.target.value)} />
            </div>
            <div>
              <Label required>Phone Number</Label>
              <Input value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Industry</Label>
              <Input value={form.industry} onChange={(e) => set('industry', e.target.value)} placeholder="e.g. Jewellery & Retail" />
            </div>
            <div>
              <Label>Company Website</Label>
              <Input value={form.companyWebsite} onChange={(e) => set('companyWebsite', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Company Size</Label>
            <Select value={form.companySize} onChange={(e) => set('companySize', e.target.value)}>
              <option value="">Select company size</option>
              <option value="1-10">1–10 employees</option>
              <option value="11-50">11–50 employees</option>
              <option value="51-200">51–200 employees</option>
              <option value="201-1000">201–1,000 employees</option>
              <option value="1000+">1,000+ employees</option>
            </Select>
          </div>
          <div>
            <Label>Additional Requirements</Label>
            <Textarea value={form.additionalRequirements} onChange={(e) => set('additionalRequirements', e.target.value)} placeholder="Anything specific you'd like us to know before the demo?" />
          </div>
          <div className="flex justify-end pt-1">
            <Button disabled={!canSubmit} loading={submitting} icon={<Sparkles className="size-4" />} onClick={submit}>
              Request Demo
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
