import { useEffect, useState } from 'react'
import { CheckCircle2, Wand2 } from 'lucide-react'
import type { CustomizationRequestInput } from '@/types'
import { leadsService } from '@/services/api'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Field'

const EMPTY: CustomizationRequestInput = {
  companyName: '',
  contactPerson: '',
  businessEmail: '',
  phone: '',
  industry: '',
  website: '',
  businessType: '',
  operatingHours: '',
  expectedCallVolume: '',
  languages: '',
  primaryUseCase: '',
  requiredCapabilities: '',
  existingSystems: '',
  currentPhoneProvider: '',
  knowledgeSources: '',
  specialRequirements: '',
}

const USE_CASES = ['Customer Support', 'Booking', 'Reservations', 'Lead Qualification', 'Order Status', 'Appointment Scheduling', 'Enquiry Handling', 'Sales', 'Other']

interface CustomizationRequestModalProps {
  open: boolean
  onClose: () => void
}

export function CustomizationRequestModal({ open, onClose }: CustomizationRequestModalProps) {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(EMPTY)
      setSubmitted(false)
    }
  }, [open])

  function set<K extends keyof CustomizationRequestInput>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const canSubmit = form.companyName.trim() && form.contactPerson.trim() && form.businessEmail.trim() && form.phone.trim() && form.industry.trim() && form.primaryUseCase.trim()

  async function submit() {
    if (!canSubmit) return
    setSubmitting(true)
    await leadsService.submitCustomizationRequest(form)
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={submitted ? undefined : "Let's Build Your Jaan"}
      description={submitted ? undefined : "Tell us about your business and what you want your AI Employee to handle. Our team will design, configure and deploy it for you."}
    >
      {submitted ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-success-100 text-success-600">
            <CheckCircle2 className="size-7" />
          </div>
          <p className="text-[17px] font-semibold text-ink-900">✓ Request received</p>
          <p className="max-w-md text-[13px] text-ink-500">An JEXA.AI specialist will contact you to understand your requirements and plan your AI Employee.</p>
          <Button className="mt-2" variant="outline" onClick={onClose}>Close</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Company Name</Label>
              <Input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
            </div>
            <div>
              <Label required>Contact Person</Label>
              <Input value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Business Email</Label>
              <Input type="email" value={form.businessEmail} onChange={(e) => set('businessEmail', e.target.value)} />
            </div>
            <div>
              <Label required>Phone</Label>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label required>Industry</Label>
              <Input value={form.industry} onChange={(e) => set('industry', e.target.value)} placeholder="e.g. Jewellery & Retail" />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => set('website', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Business Type</Label>
              <Input value={form.businessType} onChange={(e) => set('businessType', e.target.value)} placeholder="e.g. Retail chain, single store, franchise" />
            </div>
            <div>
              <Label>Operating Hours</Label>
              <Input value={form.operatingHours} onChange={(e) => set('operatingHours', e.target.value)} placeholder="e.g. 10 AM – 8 PM, all days" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Expected Call Volume</Label>
              <Input value={form.expectedCallVolume} onChange={(e) => set('expectedCallVolume', e.target.value)} placeholder="e.g. ~200 calls / month" />
            </div>
            <div>
              <Label>Languages</Label>
              <Input value={form.languages} onChange={(e) => set('languages', e.target.value)} placeholder="e.g. English, Hindi" />
            </div>
          </div>
          <div>
            <Label required>Primary Use Case</Label>
            <Select value={form.primaryUseCase} onChange={(e) => set('primaryUseCase', e.target.value)}>
              <option value="">Select a use case</option>
              {USE_CASES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Required Capabilities</Label>
            <Textarea value={form.requiredCapabilities} onChange={(e) => set('requiredCapabilities', e.target.value)} placeholder="What should your AI Employee be able to do?" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Existing Systems / APIs</Label>
              <Input value={form.existingSystems} onChange={(e) => set('existingSystems', e.target.value)} placeholder="e.g. CRM, booking system" />
            </div>
            <div>
              <Label>Current Phone Provider</Label>
              <Input value={form.currentPhoneProvider} onChange={(e) => set('currentPhoneProvider', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Knowledge Sources</Label>
            <Input value={form.knowledgeSources} onChange={(e) => set('knowledgeSources', e.target.value)} placeholder="e.g. Product catalog, FAQs, policies" />
          </div>
          <div>
            <Label>Special Requirements</Label>
            <Textarea value={form.specialRequirements} onChange={(e) => set('specialRequirements', e.target.value)} />
          </div>
          <div className="flex justify-end pt-1">
            <Button disabled={!canSubmit} loading={submitting} icon={<Wand2 className="size-4" />} onClick={submit}>
              Request Custom AI Employee
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
