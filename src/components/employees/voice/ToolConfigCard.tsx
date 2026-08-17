import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react'
import type { RiskLevel, VoiceTool } from '@/types'
import { Badge } from '@/components/ui/Badge'
import type { BadgeTone } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Field'

const RISK_CONFIG: Record<RiskLevel, { tone: BadgeTone; icon: typeof ShieldCheck; label: string }> = {
  low: { tone: 'success', icon: ShieldCheck, label: 'Low Risk' },
  medium: { tone: 'warning', icon: ShieldQuestion, label: 'Medium Risk' },
  high: { tone: 'danger', icon: ShieldAlert, label: 'High Risk' },
}

interface ToolConfigCardProps {
  tool: VoiceTool
  onToggleConnected?: (connected: boolean) => void
}

export function ToolConfigCard({ tool, onToggleConnected }: ToolConfigCardProps) {
  const risk = RISK_CONFIG[tool.risk]
  return (
    <div className="rounded-xl border border-ink-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13.5px] font-semibold text-ink-900">{tool.name}</p>
          <p className="mt-0.5 text-[13px] text-ink-500">{tool.description}</p>
        </div>
        {onToggleConnected && <Switch checked={tool.connected} onChange={onToggleConnected} label={`Toggle ${tool.name}`} />}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone="neutral">{tool.permission}</Badge>
        <Badge tone={risk.tone} icon={<risk.icon className="size-3" />}>
          {risk.label}
        </Badge>
        {tool.approvalRequired && <Badge tone="warning">Approval Required</Badge>}
        <Badge tone={tool.connected ? 'success' : 'neutral'} dot>
          {tool.connected ? 'Connected' : 'Not Connected'}
        </Badge>
      </div>
    </div>
  )
}
