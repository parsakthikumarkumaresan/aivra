import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Field'
import { useToast } from '@/hooks/useToast'
import { useLeadFlow } from '@/app/LeadFlowContext'
import { authService } from '@/services/api'
import { isApiError } from '@/services/api/errors'

export default function LoginPage() {
  const navigate = useNavigate()
  const { show } = useToast()
  const { openDemoRequest } = useLeadFlow()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('Enter your work email and password to continue.')
      return
    }
    setLoading(true)
    try {
      const user = await authService.login(email, password)
      show({ tone: 'success', title: 'Welcome back', description: `Signed in as ${user.fullName}.` })
      navigate('/app')
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-between px-8 py-8 sm:px-16">
        <Link to="/">
          <Logo />
        </Link>
        <div className="mx-auto w-full max-w-sm py-12">
          <h1 className="text-[24px] font-bold tracking-tight text-ink-900">Sign in to AIVRA</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-500">Manage your AI workforce for Acme Corporation.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email" required>
                Work email
              </Label>
              <Input
                id="email"
                type="email"
                icon={<Mail className="size-4" />}
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={Boolean(error)}
              />
            </div>
            <div>
              <Label htmlFor="password" required>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                icon={<Lock className="size-4" />}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(error)}
              />
            </div>
            {error && <p className="text-[13px] font-medium text-danger-600">{error}</p>}
            <Button type="submit" className="w-full" size="lg" loading={loading} iconRight={!loading && <ArrowRight className="size-4" />}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-2 rounded-lg bg-ink-25 px-3.5 py-3 text-xs text-ink-500">
            <ShieldCheck className="size-4 shrink-0 text-ink-400" />
            Protected by enterprise-grade authentication and audit logging.
          </div>

          <p className="mt-8 text-center text-[13px] text-ink-500">
            Don't have an account?{' '}
            <button type="button" onClick={() => openDemoRequest('hr')} className="font-semibold text-brand-600 hover:text-brand-700">
              Book a demo
            </button>
          </p>
        </div>
        <p className="text-xs text-ink-400">© {new Date().getFullYear()} AIVRA Technologies Inc.</p>
      </div>

      <div className="relative hidden overflow-hidden bg-brand-600 lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-brand-500/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-brand-700/50 blur-3xl" />
        <div className="relative">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-brand-200">AI Workforce Operating System</p>
          <h2 className="mt-4 max-w-md text-[30px] font-bold leading-tight text-white">
            Every AI Employee action is visible, governed and auditable.
          </h2>
          <div className="mt-10 space-y-4">
            {[
              { label: 'Candidates Processed', value: '184' },
              { label: 'Calls Handled', value: '1,248' },
              { label: 'Pending Approvals', value: '3' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between rounded-xl bg-white/10 px-5 py-3.5 backdrop-blur-sm">
                <span className="text-[13.5px] text-brand-100">{stat.label}</span>
                <span className="text-lg font-bold text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
