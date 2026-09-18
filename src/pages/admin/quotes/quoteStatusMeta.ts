import type { BadgeTone } from '@/components/ui/Badge'
import type { QuoteStatus } from '@/services/api'

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
}

export const QUOTE_STATUS_TONE: Record<QuoteStatus, BadgeTone> = {
  draft: 'neutral',
  sent: 'info',
  accepted: 'success',
  rejected: 'danger',
  expired: 'neutral',
}

export const QUOTE_CATEGORY_LABEL: Record<string, string> = {
  implementation: 'Implementation / Setup',
  platform: 'Platform & Maintenance',
  voice_credits: 'Voice Usage / Credits',
  integrations: 'Integrations',
  development: 'Custom Engineering',
  other: 'Other Services',
}
