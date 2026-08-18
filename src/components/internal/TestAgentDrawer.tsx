import { useEffect, useState } from 'react'
import { Bot, PhoneOff, Send, Sparkles } from 'lucide-react'
import type { TranscriptTurn, VoiceAgent } from '@/types'
import { voiceAgentBuilderService } from '@/services/api'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Transcript } from '@/components/ui/Transcript'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { nextId } from '@/services/mock/utils'

const SAMPLE_CONTEXT: Record<string, string> = { customer_name: 'Priya', customer_id: 'CUST-88213', customer_type: 'premium' }

function renderTemplate(text: string) {
  return text.replace(/\$\{(\w+)\}/g, (_, key) => SAMPLE_CONTEXT[key] ?? key)
}

interface TestAgentDrawerProps {
  open: boolean
  onClose: () => void
  agent: VoiceAgent
}

export function TestAgentDrawer({ open, onClose, agent }: TestAgentDrawerProps) {
  const [turns, setTurns] = useState<TranscriptTurn[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [debug, setDebug] = useState<{ currentNodeName: string; toolCalled?: string; knowledgeRetrieved?: string; contextSnapshot: Record<string, string> } | null>(null)

  useEffect(() => {
    if (open) {
      setTurns([{ id: nextId('test'), speaker: 'ai', text: renderTemplate(agent.promptConfig.introMessage), timestamp: new Date().toISOString() }])
      setDebug({ currentNodeName: 'Greeting', contextSnapshot: SAMPLE_CONTEXT })
      setInput('')
    }
  }, [open, agent.id])

  async function send() {
    if (!input.trim() || sending) return
    setSending(true)
    const text = input
    setInput('')
    const result = await voiceAgentBuilderService.sendTestMessage(agent.id, text)
    setTurns((prev) => [...prev, result.userTurn, result.agentTurn])
    setDebug(result.debug)
    setSending(false)
  }

  function endCall() {
    setTurns((prev) => [...prev, { id: nextId('test'), speaker: 'system', text: 'Call ended.', timestamp: new Date().toISOString() }])
  }

  return (
    <Drawer open={open} onClose={onClose} title="Test Agent" description={agent.name} width="640px">
      <div className="flex h-full flex-col gap-4">
        <div className="flex-1 overflow-y-auto rounded-xl border border-ink-200 bg-ink-25 p-4">
          <Transcript turns={turns} />
          {sending && (
            <div className="mt-3 flex items-center gap-2 text-xs text-ink-400">
              <Bot className="size-3.5 animate-pulse" />
              Agent is thinking…
            </div>
          )}
        </div>

        <Card>
          <CardHeader title="Debug" />
          <CardBody className="space-y-2 text-[12.5px]">
            <div className="flex justify-between"><span className="text-ink-500">Current Node</span><span className="font-medium text-ink-800">{debug?.currentNodeName ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Tool</span><span className="font-medium text-ink-800">{debug?.toolCalled ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Knowledge</span><span className="font-medium text-ink-800">{debug?.knowledgeRetrieved ?? '—'}</span></div>
            {debug?.contextSnapshot && Object.keys(debug.contextSnapshot).length > 0 && (
              <div className="border-t border-ink-100 pt-2">
                <p className="mb-1 text-ink-500">Context</p>
                {Object.entries(debug.contextSnapshot).map(([k, v]) => (
                  <div key={k} className="flex justify-between font-mono text-[11.5px]">
                    <span className="text-ink-500">{k}</span>
                    <span className="text-ink-800">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type what the caller would say…" icon={<Sparkles className="size-4" />} />
          <Button type="submit" size="icon" icon={<Send className="size-4" />} disabled={!input.trim()} loading={sending} aria-label="Send" />
          <Button type="button" variant="outline" size="icon" icon={<PhoneOff className="size-4" />} onClick={endCall} aria-label="End call" />
        </form>
      </div>
    </Drawer>
  )
}
