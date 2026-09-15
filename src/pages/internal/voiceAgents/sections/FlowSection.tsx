import { useState } from 'react'
import { ArrowRight, Flag, GitBranch, MessageSquare, PhoneForwarded, Play, Plus, Trash2, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { SectionProps } from '../BuilderTypes'
import type { FlowNode, FlowNodeType } from '@/types'
import { FLOW_NODE_TYPE_LABEL } from '@/types'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Drawer } from '@/components/ui/Drawer'
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog'
import { Input, Label, Select, Textarea, Checkbox } from '@/components/ui/Field'
import { nextId } from '@/services/mock/utils'

const NODE_TYPE_ICON: Record<FlowNodeType, LucideIcon> = {
  greeting: Play,
  prompt: MessageSquare,
  condition: GitBranch,
  tool: Wrench,
  transfer: PhoneForwarded,
  collect_information: MessageSquare,
  api_action: Wrench,
  end: Flag,
}

const NODE_TYPE_TONE: Record<FlowNodeType, BadgeTone> = {
  greeting: 'brand',
  prompt: 'info',
  condition: 'warning',
  tool: 'success',
  transfer: 'danger',
  collect_information: 'info',
  api_action: 'success',
  end: 'neutral',
}

function emptyNode(column: number, row: number): FlowNode {
  return { id: nextId('node'), type: 'prompt', name: '', prompt: '', nextNodeIds: [], column, row }
}

export default function FlowSection({ agent, patch }: SectionProps) {
  const config = agent.flowConfig
  const [drawerNode, setDrawerNode] = useState<FlowNode | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FlowNode | null>(null)
  const [highlighted, setHighlighted] = useState<string | null>(null)

  const columns = Array.from(new Set(config.nodes.map((n) => n.column))).sort((a, b) => a - b)
  const nodeById = (id: string) => config.nodes.find((n) => n.id === id)

  function openNew() {
    const maxColumn = Math.max(0, ...config.nodes.map((n) => n.column))
    setDrawerNode(emptyNode(maxColumn + 1, 0))
    setIsNew(true)
  }

  function openEdit(node: FlowNode) {
    setDrawerNode(node)
    setIsNew(false)
  }

  function commitNode(node: FlowNode) {
    const nodes = isNew ? [...config.nodes, node] : config.nodes.map((n) => (n.id === node.id ? node : n))
    patch('flowConfig', { ...config, nodes })
    setDrawerNode(null)
  }

  function deleteNode() {
    if (!deleteTarget) return
    const nodes = config.nodes
      .filter((n) => n.id !== deleteTarget.id)
      .map((n) => ({
        ...n,
        nextNodeIds: n.nextNodeIds.filter((id) => id !== deleteTarget.id),
        fallbackNodeId: n.fallbackNodeId === deleteTarget.id ? undefined : n.fallbackNodeId,
      }))
    const startNodeId = config.startNodeId === deleteTarget.id ? (nodes[0]?.id ?? '') : config.startNodeId
    patch('flowConfig', { nodes, startNodeId })
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Conversation Flow"
          description={`${config.nodes.length} nodes — starts at "${nodeById(config.startNodeId)?.name ?? '—'}"`}
          actions={<Button size="sm" icon={<Plus className="size-3.5" />} onClick={openNew}>Add Node</Button>}
        />
        <CardBody className="overflow-x-auto">
          <div className="flex min-w-max items-start gap-3 pb-2">
            {columns.map((col, i) => (
              <div key={col} className="flex items-start gap-3">
                <div className="flex w-56 shrink-0 flex-col gap-3">
                  {config.nodes.filter((n) => n.column === col).sort((a, b) => a.row - b.row).map((node) => {
                    const Icon = NODE_TYPE_ICON[node.type]
                    const isStart = node.id === config.startNodeId
                    return (
                      <button
                        key={node.id}
                        onClick={() => openEdit(node)}
                        onMouseEnter={() => setHighlighted(node.id)}
                        onMouseLeave={() => setHighlighted(null)}
                        className={`rounded-xl border p-3.5 text-left transition-colors duration-150 ${highlighted === node.id ? 'border-brand-400 bg-brand-50/40' : 'border-ink-200 bg-surface hover:border-brand-300'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Badge tone={NODE_TYPE_TONE[node.type]} icon={<Icon className="size-3" />}>{FLOW_NODE_TYPE_LABEL[node.type]}</Badge>
                          {isStart && <Badge tone="brand">Start</Badge>}
                        </div>
                        <p className="mt-2 text-[13.5px] font-semibold text-ink-900">{node.name || 'Untitled node'}</p>
                        {(node.prompt || node.condition) && (
                          <p className="mt-1 line-clamp-2 text-[12px] text-ink-500">{node.prompt || node.condition}</p>
                        )}
                        {node.toolId && <p className="mt-1.5 flex items-center gap-1 text-[11px] text-ink-500"><Wrench className="size-3" />{agent.tools.find((t) => t.id === node.toolId)?.name ?? node.toolId}</p>}
                        {node.nextNodeIds.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1 border-t border-ink-100 pt-2">
                            {node.nextNodeIds.map((id) => (
                              <span key={id} className="flex items-center gap-0.5 rounded-full bg-ink-100 px-2 py-0.5 text-[10.5px] text-ink-600">
                                <ArrowRight className="size-2.5" />
                                {nodeById(id)?.name ?? '—'}
                              </span>
                            ))}
                          </div>
                        )}
                        {node.fallbackNodeId && (
                          <p className="mt-1.5 text-[10.5px] text-warning-600">Fallback → {nodeById(node.fallbackNodeId)?.name ?? '—'}</p>
                        )}
                      </button>
                    )
                  })}
                </div>
                {i < columns.length - 1 && (
                  <div className="mt-8 flex h-9 shrink-0 items-center text-ink-300">
                    <ArrowRight className="size-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Drawer
        open={Boolean(drawerNode)}
        onClose={() => setDrawerNode(null)}
        title={isNew ? 'Add Node' : 'Edit Node'}
        footer={
          !isNew && drawerNode ? (
            <>
              <Button variant="outline" onClick={() => setDeleteTarget(drawerNode)} icon={<Trash2 className="size-3.5" />}>Delete</Button>
              <span className="flex-1" />
              <Button variant="outline" onClick={() => setDrawerNode(null)}>Cancel</Button>
              <Button onClick={() => drawerNode && commitNode(drawerNode)}>Save Node</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setDrawerNode(null)}>Cancel</Button>
              <Button onClick={() => drawerNode && commitNode(drawerNode)} disabled={!drawerNode?.name.trim()}>Add Node</Button>
            </>
          )
        }
      >
        {drawerNode && (
          <div className="space-y-4">
            <div>
              <Label required>Node name</Label>
              <Input value={drawerNode.name} onChange={(e) => setDrawerNode({ ...drawerNode, name: e.target.value })} placeholder="e.g. Check Availability" />
            </div>
            <div>
              <Label>Node type</Label>
              <Select value={drawerNode.type} onChange={(e) => setDrawerNode({ ...drawerNode, type: e.target.value as FlowNodeType })}>
                {(Object.keys(FLOW_NODE_TYPE_LABEL) as FlowNodeType[]).map((t) => (
                  <option key={t} value={t}>{FLOW_NODE_TYPE_LABEL[t]}</option>
                ))}
              </Select>
            </div>
            {drawerNode.type === 'condition' ? (
              <div>
                <Label>Condition</Label>
                <Textarea value={drawerNode.condition ?? ''} onChange={(e) => setDrawerNode({ ...drawerNode, condition: e.target.value })} placeholder="What determines which branch to take?" />
              </div>
            ) : (
              <div>
                <Label>Prompt</Label>
                <Textarea value={drawerNode.prompt ?? ''} onChange={(e) => setDrawerNode({ ...drawerNode, prompt: e.target.value })} placeholder="What should the agent do or say at this step?" />
              </div>
            )}
            {(drawerNode.type === 'tool' || drawerNode.type === 'api_action') && (
              <div>
                <Label>Tool</Label>
                <Select value={drawerNode.toolId ?? ''} onChange={(e) => setDrawerNode({ ...drawerNode, toolId: e.target.value || undefined })}>
                  <option value="">Select a tool…</option>
                  {agent.tools.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </div>
            )}
            <div>
              <Label>Next step(s)</Label>
              <div className="space-y-1.5 rounded-lg border border-ink-200 p-2.5">
                {config.nodes.filter((n) => n.id !== drawerNode.id).map((n) => (
                  <Checkbox
                    key={n.id}
                    id={`next-${n.id}`}
                    checked={drawerNode.nextNodeIds.includes(n.id)}
                    onChange={(checked) => {
                      const nextNodeIds = checked ? [...drawerNode.nextNodeIds, n.id] : drawerNode.nextNodeIds.filter((id) => id !== n.id)
                      setDrawerNode({ ...drawerNode, nextNodeIds })
                    }}
                    label={n.name || 'Untitled node'}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Fallback (optional)</Label>
              <Select value={drawerNode.fallbackNodeId ?? ''} onChange={(e) => setDrawerNode({ ...drawerNode, fallbackNodeId: e.target.value || undefined })}>
                <option value="">None</option>
                {config.nodes.filter((n) => n.id !== drawerNode.id).map((n) => (
                  <option key={n.id} value={n.id}>{n.name || 'Untitled node'}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Column (stage)</Label>
                <Input type="number" min={0} value={drawerNode.column} onChange={(e) => setDrawerNode({ ...drawerNode, column: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Row (branch position)</Label>
                <Input type="number" min={0} value={drawerNode.row} onChange={(e) => setDrawerNode({ ...drawerNode, row: Number(e.target.value) })} />
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteNode}
        destructive
        title={`Delete "${deleteTarget?.name}"?`}
        description="Any other node pointing to this one will lose that connection."
        confirmLabel="Delete Node"
      />
    </div>
  )
}
