import { useState } from 'react'
import { FlaskConical, Plus, Wrench } from 'lucide-react'
import type { SectionProps } from '../BuilderTypes'
import type { ToolAuthType, ToolHttpMethod, ToolKind, VoiceAgentTool } from '@/types'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Drawer } from '@/components/ui/Drawer'
import { Input, Label, Select, Switch, Textarea } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/hooks/useToast'
import { nextId } from '@/services/mock/utils'

const METHODS: ToolHttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE']
const AUTH_TYPES: ToolAuthType[] = ['none', 'api_key', 'bearer']
const KINDS: ToolKind[] = ['api', 'transfer', 'internal']

function emptyTool(): VoiceAgentTool {
  return { id: nextId('tool'), name: '', description: '', kind: 'api', method: 'GET', endpoint: '', authType: 'none', inputs: [], outputs: [], enabled: true }
}

function fieldListToText(fields: { name: string }[]) {
  return fields.map((f) => f.name).join(', ')
}
function textToFieldList(text: string): { name: string; type: string; required: boolean }[] {
  return text.split(',').map((s) => s.trim()).filter(Boolean).map((name) => ({ name, type: 'string', required: false }))
}

export default function ToolsSection({ agent, patch }: SectionProps) {
  const { show } = useToast()
  const [drawerTool, setDrawerTool] = useState<VoiceAgentTool | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)

  function commit(tool: VoiceAgentTool) {
    const tools = isNew ? [...agent.tools, tool] : agent.tools.map((t) => (t.id === tool.id ? tool : t))
    patch('tools', tools)
    setDrawerTool(null)
  }

  function toggleEnabled(id: string, enabled: boolean) {
    patch('tools', agent.tools.map((t) => (t.id === id ? { ...t, enabled } : t)))
  }

  async function testTool(tool: VoiceAgentTool) {
    setTesting(tool.id)
    await new Promise((r) => setTimeout(r, 900))
    setTesting(null)
    show({ tone: 'success', title: `${tool.name} — test successful`, description: `Mock response: ${tool.outputs.map((o) => o.name).join(', ') || 'ok: true'}` })
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Tools" description="Actions this agent can execute during a call." actions={<Button size="sm" icon={<Plus className="size-3.5" />} onClick={() => { setDrawerTool(emptyTool()); setIsNew(true) }}>Add Tool</Button>} />
        {agent.tools.length === 0 ? (
          <CardBody><EmptyState compact icon={<Wrench className="size-6" />} title="No tools configured" description="Add a tool to let the agent take real actions." /></CardBody>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            {agent.tools.map((tool) => (
              <div key={tool.id} className="rounded-xl border border-ink-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13.5px] font-semibold text-ink-900">{tool.name}</p>
                    <p className="mt-0.5 text-[12.5px] text-ink-500">{tool.description}</p>
                  </div>
                  <Switch checked={tool.enabled} onChange={(v) => toggleEnabled(tool.id, v)} label={`Toggle ${tool.name}`} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge tone="neutral" className="capitalize">{tool.kind}</Badge>
                  <Badge tone="info">{tool.method}</Badge>
                  <Badge tone={tool.authType === 'none' ? 'neutral' : 'success'}>{tool.authType === 'none' ? 'No auth' : tool.authType === 'api_key' ? 'API key' : 'Bearer token'}</Badge>
                </div>
                <p className="mt-2 truncate font-mono text-[11px] text-ink-400">{tool.endpoint}</p>
                {tool.inputs.length > 0 && <p className="mt-1.5 text-[11px] text-ink-500">In: {fieldListToText(tool.inputs)}</p>}
                {tool.outputs.length > 0 && <p className="text-[11px] text-ink-500">Out: {fieldListToText(tool.outputs)}</p>}
                <div className="mt-3 flex items-center gap-2 border-t border-ink-100 pt-3">
                  <Button size="sm" variant="outline" onClick={() => { setDrawerTool(tool); setIsNew(false) }}>Configure</Button>
                  <Button size="sm" variant="ghost" icon={<FlaskConical className="size-3.5" />} loading={testing === tool.id} onClick={() => testTool(tool)}>Test</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Drawer
        open={Boolean(drawerTool)}
        onClose={() => setDrawerTool(null)}
        title={isNew ? 'Add Tool' : `Configure — ${drawerTool?.name || 'Tool'}`}
        width="480px"
        footer={<><Button variant="outline" onClick={() => setDrawerTool(null)}>Cancel</Button><Button onClick={() => drawerTool && commit(drawerTool)} disabled={!drawerTool?.name.trim()}>Save Tool</Button></>}
      >
        {drawerTool && (
          <div className="space-y-4">
            <div>
              <Label required>Tool name</Label>
              <Input value={drawerTool.name} onChange={(e) => setDrawerTool({ ...drawerTool, name: e.target.value })} placeholder="e.g. Check Availability" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={drawerTool.description} onChange={(e) => setDrawerTool({ ...drawerTool, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={drawerTool.kind} onChange={(e) => setDrawerTool({ ...drawerTool, kind: e.target.value as ToolKind })}>
                  {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                </Select>
              </div>
              <div>
                <Label>Method</Label>
                <Select value={drawerTool.method} onChange={(e) => setDrawerTool({ ...drawerTool, method: e.target.value as ToolHttpMethod })}>
                  {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
              </div>
            </div>
            <div>
              <Label>Endpoint</Label>
              <Input value={drawerTool.endpoint} onChange={(e) => setDrawerTool({ ...drawerTool, endpoint: e.target.value })} placeholder="https://api.example.com/…" className="font-mono text-[12.5px]" />
            </div>
            <div>
              <Label>Authentication</Label>
              <Select value={drawerTool.authType} onChange={(e) => setDrawerTool({ ...drawerTool, authType: e.target.value as ToolAuthType })}>
                {AUTH_TYPES.map((a) => <option key={a} value={a}>{a === 'none' ? 'None' : a === 'api_key' ? 'API Key' : 'Bearer Token'}</option>)}
              </Select>
              {drawerTool.authType !== 'none' && (
                <Input className="mt-2 font-mono text-[12.5px]" value={drawerTool.maskedCredential ?? ''} onChange={(e) => setDrawerTool({ ...drawerTool, maskedCredential: e.target.value })} placeholder="sk_live_••••••••1a2b (masked)" />
              )}
            </div>
            <div>
              <Label>Inputs (comma-separated)</Label>
              <Input value={fieldListToText(drawerTool.inputs)} onChange={(e) => setDrawerTool({ ...drawerTool, inputs: textToFieldList(e.target.value) })} placeholder="date, location, service_type" />
            </div>
            <div>
              <Label>Outputs (comma-separated)</Label>
              <Input value={fieldListToText(drawerTool.outputs)} onChange={(e) => setDrawerTool({ ...drawerTool, outputs: textToFieldList(e.target.value) })} placeholder="available, slots" />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
