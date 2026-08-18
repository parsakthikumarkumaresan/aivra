import { useState } from 'react'
import { Plus, Trash2, Zap } from 'lucide-react'
import type { SectionProps } from '../BuilderTypes'
import type { CallAction } from '@/types'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { Input, Label, Switch } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { nextId } from '@/services/mock/utils'

function emptyAction(): CallAction {
  return { id: nextId('ca'), name: '', trigger: 'After Call End', destination: '', payloadFields: [], enabled: true }
}

export default function CallActionsSection({ agent, patch }: SectionProps) {
  const { actions } = agent.callActionsConfig
  const [drawerAction, setDrawerAction] = useState<CallAction | null>(null)
  const [isNew, setIsNew] = useState(false)

  function commit(a: CallAction) {
    const next = isNew ? [...actions, a] : actions.map((x) => (x.id === a.id ? a : x))
    patch('callActionsConfig', { actions: next })
    setDrawerAction(null)
  }

  function toggle(id: string, enabled: boolean) {
    patch('callActionsConfig', { actions: actions.map((a) => (a.id === id ? { ...a, enabled } : a)) })
  }

  function remove(id: string) {
    patch('callActionsConfig', { actions: actions.filter((a) => a.id !== id) })
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Call Actions" description="External systems to notify when something happens on a call." actions={<Button size="sm" icon={<Plus className="size-3.5" />} onClick={() => { setDrawerAction(emptyAction()); setIsNew(true) }}>Add Action</Button>} />
        {actions.length === 0 ? (
          <CardBody><EmptyState compact icon={<Zap className="size-6" />} title="No call actions yet" description="Add an action to notify a CRM, ticketing system or webhook." /></CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {actions.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-ink-900">{a.name}</p>
                  <p className="text-xs text-ink-500">Trigger: {a.trigger} · <span className="font-mono">{a.destination}</span></p>
                  {a.payloadFields.length > 0 && <p className="mt-1 text-[11px] text-ink-400">Payload: {a.payloadFields.join(', ')}</p>}
                </div>
                <Switch checked={a.enabled} onChange={(v) => toggle(a.id, v)} />
                <Button size="sm" variant="outline" onClick={() => { setDrawerAction(a); setIsNew(false) }}>Edit</Button>
                <button onClick={() => remove(a.id)} className="text-ink-400 hover:text-danger-600" aria-label={`Remove ${a.name}`}><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Drawer
        open={Boolean(drawerAction)}
        onClose={() => setDrawerAction(null)}
        title={isNew ? 'Add Action' : 'Edit Action'}
        footer={<><Button variant="outline" onClick={() => setDrawerAction(null)}>Cancel</Button><Button onClick={() => drawerAction && commit(drawerAction)} disabled={!drawerAction?.name.trim()}>Save Action</Button></>}
      >
        {drawerAction && (
          <div className="space-y-4">
            <div>
              <Label required>Name</Label>
              <Input value={drawerAction.name} onChange={(e) => setDrawerAction({ ...drawerAction, name: e.target.value })} placeholder="e.g. Create CRM Ticket" />
            </div>
            <div>
              <Label>Trigger</Label>
              <Input value={drawerAction.trigger} onChange={(e) => setDrawerAction({ ...drawerAction, trigger: e.target.value })} placeholder="e.g. After Call End, Booking Confirmed" />
            </div>
            <div>
              <Label>Destination</Label>
              <Input value={drawerAction.destination} onChange={(e) => setDrawerAction({ ...drawerAction, destination: e.target.value })} placeholder="POST /tickets" className="font-mono text-[12.5px]" />
            </div>
            <div>
              <Label>Payload fields (comma-separated)</Label>
              <Input value={drawerAction.payloadFields.join(', ')} onChange={(e) => setDrawerAction({ ...drawerAction, payloadFields: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="customer_id, summary, priority" />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
