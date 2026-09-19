import { Link } from 'react-router-dom'
import { Wallet, Info, ScrollText } from 'lucide-react'
import { PageHeader, Card, CardHeader, CardBody, Button } from '@/components/ui'

// JEXA Admin Settings — there is no dedicated settings/feature-flag/system-
// config table anywhere in the backend. The one real, DB-backed,
// admin-editable configuration surface that exists today is Jaan Voice
// recharge package pricing (app.ai_employees.voice RechargePackage,
// already live on the Credits page) — linked out to here rather than
// duplicated. Everything else a "Settings" page usually holds (provider
// config, feature flags, notification config) has no backend model, so it
// isn't faked here.
export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Settings"
        description="Real, backend-supported configuration only — nothing fabricated."
      />

      <Card>
        <CardHeader title="Jaan Voice Recharge Pricing" description="The one real, DB-backed configuration surface today — managed on the Credits page to avoid a second place that edits it." />
        <CardBody>
          <Link to="/admin/credits">
            <Button variant="outline" icon={<Wallet className="size-4" />}>Manage Recharge Packages</Button>
          </Link>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Audit Logs" description="Every recorded admin action across every customer — platform-role gated." />
        <CardBody>
          <Link to="/admin/audit-logs">
            <Button variant="outline" icon={<ScrollText className="size-4" />}>View Audit Logs</Button>
          </Link>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="What's not here" />
        <CardBody className="flex items-start gap-3">
          <Info className="mt-0.5 size-4 shrink-0 text-ink-400" />
          <p className="text-[13px] leading-relaxed text-ink-500">
            Provider configuration, feature flags, notification defaults, and platform-wide system
            settings have no backend model or API — there's nothing real to expose here yet. Building
            those needs a settings/config table first; this page won't show placeholder toggles that
            don't actually do anything.
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
