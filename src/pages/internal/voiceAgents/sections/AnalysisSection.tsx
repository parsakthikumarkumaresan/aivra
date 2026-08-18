import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { SectionProps } from '../BuilderTypes'
import type { AnalysisField } from '@/types'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Checkbox, Input, Select } from '@/components/ui/Field'
import { nextId } from '@/services/mock/utils'

const OUTPUT_TYPES: AnalysisField['outputType'][] = ['text', 'boolean', 'number', 'enum']

export default function AnalysisSection({ agent, patch }: SectionProps) {
  const config = agent.analysisConfig
  const [newField, setNewField] = useState<AnalysisField>({ id: '', name: '', description: '', outputType: 'text' })

  function set<K extends keyof typeof config>(key: K, value: (typeof config)[K]) {
    patch('analysisConfig', { ...config, [key]: value })
  }

  function addField() {
    if (!newField.name.trim()) return
    set('customFields', [...config.customFields, { ...newField, id: nextId('af') }])
    setNewField({ id: '', name: '', description: '', outputType: 'text' })
  }

  function removeField(id: string) {
    set('customFields', config.customFields.filter((f) => f.id !== id))
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Built-in Analysis" description="Runs automatically on every completed call." />
        <CardBody className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Checkbox checked={config.intentDetection} onChange={(v) => set('intentDetection', v)} label="Intent Detection" />
          <Checkbox checked={config.sentimentAnalysis} onChange={(v) => set('sentimentAnalysis', v)} label="Sentiment Analysis" />
          <Checkbox checked={config.resolutionDetection} onChange={(v) => set('resolutionDetection', v)} label="Resolution Detection" />
          <Checkbox checked={config.summary} onChange={(v) => set('summary', v)} label="Summary" />
          <Checkbox checked={config.keyTopics} onChange={(v) => set('keyTopics', v)} label="Key Topics" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Custom Evaluation Fields" description="Extract business-specific signals from every call." />
        <CardBody className="space-y-3">
          {config.customFields.length === 0 ? (
            <p className="text-[13px] text-ink-500">No custom fields yet.</p>
          ) : (
            config.customFields.map((f) => (
              <div key={f.id} className="flex items-start justify-between gap-3 rounded-lg border border-ink-200 p-3">
                <div>
                  <p className="text-[13px] font-semibold text-ink-900">{f.name} <span className="ml-1 text-xs font-normal text-ink-400">({f.outputType})</span></p>
                  <p className="text-xs text-ink-500">{f.description}</p>
                </div>
                <button onClick={() => removeField(f.id)} className="text-ink-400 hover:text-danger-600" aria-label={`Remove ${f.name}`}><Trash2 className="size-4" /></button>
              </div>
            ))
          )}

          <div className="grid grid-cols-1 gap-3 rounded-lg border border-dashed border-ink-200 p-3.5 sm:grid-cols-[1fr_1fr_140px_auto]">
            <Input placeholder="Field name" value={newField.name} onChange={(e) => setNewField({ ...newField, name: e.target.value })} />
            <Input placeholder="Description" value={newField.description} onChange={(e) => setNewField({ ...newField, description: e.target.value })} />
            <Select value={newField.outputType} onChange={(e) => setNewField({ ...newField, outputType: e.target.value as AnalysisField['outputType'] })}>
              {OUTPUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Button size="sm" icon={<Plus className="size-3.5" />} onClick={addField} disabled={!newField.name.trim()}>Add</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
