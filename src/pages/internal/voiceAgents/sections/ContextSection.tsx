import { useState } from 'react'
import { Database, Plus, Trash2 } from 'lucide-react'
import type { SectionProps } from '../BuilderTypes'
import type { ContextVariable, ContextVariableType } from '@/types'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Drawer } from '@/components/ui/Drawer'
import { Input, Label, Select, Textarea, Checkbox } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { nextId } from '@/services/mock/utils'

const TYPE_OPTIONS: ContextVariableType[] = ['string', 'number', 'boolean', 'date']

function emptyVariable(): ContextVariable {
  return { id: nextId('ctx'), name: '', type: 'string', description: '', source: 'Collected during call', required: false, sampleValue: '' }
}

export default function ContextSection({ agent, patch }: SectionProps) {
  const { variables } = agent.contextConfig
  const [drawerVar, setDrawerVar] = useState<ContextVariable | null>(null)
  const [isNew, setIsNew] = useState(false)

  function commit(v: ContextVariable) {
    const next = isNew ? [...variables, v] : variables.map((x) => (x.id === v.id ? v : x))
    patch('contextConfig', { variables: next })
    setDrawerVar(null)
  }

  function remove(id: string) {
    patch('contextConfig', { variables: variables.filter((v) => v.id !== id) })
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Variables" description="Data the agent can reference during a call — from a CRM lookup, collected live, or from history." actions={<Button size="sm" icon={<Plus className="size-3.5" />} onClick={() => { setDrawerVar(emptyVariable()); setIsNew(true) }}>Add Variable</Button>} />
        {variables.length === 0 ? (
          <CardBody><EmptyState compact icon={<Database className="size-6" />} title="No context variables yet" description="Add a variable to make it available in Prompt and Flow." /></CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {variables.map((v) => (
              <div key={v.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-[13px] font-semibold text-ink-900">{v.name}</code>
                    <Badge tone="neutral">{v.type}</Badge>
                    {v.required && <Badge tone="warning">Required</Badge>}
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-ink-500">{v.description}</p>
                  <p className="mt-1 text-[11px] text-ink-400">Source: {v.source}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setDrawerVar(v); setIsNew(false) }}>Edit</Button>
                <button onClick={() => remove(v.id)} className="text-ink-400 hover:text-danger-600" aria-label={`Remove ${v.name}`}><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Current Context" description="Preview using sample values" />
        <CardBody className="space-y-1.5 font-mono text-[12.5px]">
          {variables.length === 0 ? (
            <p className="font-sans text-[13px] text-ink-500">No variables to preview.</p>
          ) : (
            variables.map((v) => (
              <div key={v.id} className="flex justify-between">
                <span className="text-ink-500">{v.name}</span>
                <span className="text-ink-800">{v.sampleValue || '—'}</span>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <Drawer
        open={Boolean(drawerVar)}
        onClose={() => setDrawerVar(null)}
        title={isNew ? 'Add Variable' : 'Edit Variable'}
        footer={<><Button variant="outline" onClick={() => setDrawerVar(null)}>Cancel</Button><Button onClick={() => drawerVar && commit(drawerVar)} disabled={!drawerVar?.name.trim()}>Save Variable</Button></>}
      >
        {drawerVar && (
          <div className="space-y-4">
            <div>
              <Label required>Name</Label>
              <Input value={drawerVar.name} onChange={(e) => setDrawerVar({ ...drawerVar, name: e.target.value })} placeholder="e.g. customer_name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={drawerVar.type} onChange={(e) => setDrawerVar({ ...drawerVar, type: e.target.value as ContextVariableType })}>
                  {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </div>
              <div>
                <Label>Sample value</Label>
                <Input value={drawerVar.sampleValue} onChange={(e) => setDrawerVar({ ...drawerVar, sampleValue: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={drawerVar.description} onChange={(e) => setDrawerVar({ ...drawerVar, description: e.target.value })} />
            </div>
            <div>
              <Label>Source</Label>
              <Input value={drawerVar.source} onChange={(e) => setDrawerVar({ ...drawerVar, source: e.target.value })} placeholder="e.g. CRM lookup, Collected during call" />
            </div>
            <Checkbox checked={drawerVar.required} onChange={(v) => setDrawerVar({ ...drawerVar, required: v })} label="Required — the agent should always try to collect this" />
          </div>
        )}
      </Drawer>
    </div>
  )
}
