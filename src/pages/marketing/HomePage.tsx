import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ListChecks,
  ShieldCheck,
  Zap,
  Plug2,
  Users,
  CheckCircle2,
  Mic,
  FileText,
  Calendar,
  MessageSquare,
  Brain,
  Building2,
  Mail,
  PhoneCall,
  Landmark,
  ClipboardCheck,
  ScanSearch,
  UserCheck,
} from 'lucide-react'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { DashboardPreview } from '@/components/marketing/DashboardPreview'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Reveal } from '@/components/ui/Reveal'
import { useLeadFlow } from '@/app/LeadFlowContext'

const TRUSTED_BY = ['ACME CORPORATION', 'QUICKSERVE', 'NEXORA', 'FINEDGE', 'BROADHOMES', 'SKYLINE REALTY']

const BENEFITS = [
  {
    icon: Users,
    title: 'Deploy AI Employees',
    description: 'Choose from a catalog of role-based AI employees or configure one for your business in minutes.',
  },
  {
    icon: Plug2,
    title: 'Connect Your Systems',
    description: 'Securely connect calendars, ATS, CRM, telephony and email so employees can act, not just chat.',
  },
  {
    icon: Zap,
    title: 'Automate Workflows',
    description: 'AI employees execute multi-step business tasks end-to-end and get work done, not just answers.',
  },
  {
    icon: ShieldCheck,
    title: 'Governed & Secure',
    description: 'Enterprise-grade permissions, approvals and a full audit trail for every action taken.',
  },
]

const HR_FEATURES = [
  { icon: FileText, text: 'Generates job descriptions and evaluation rubrics' },
  { icon: ScanSearch, text: 'Screens resumes with evidence-backed scoring' },
  { icon: Mic, text: 'Conducts structured AI interviews, not scripted quizzes' },
  { icon: UserCheck, text: 'Final hiring decisions always stay with your team' },
]

const VOICE_FEATURES = [
  { icon: Building2, text: 'Configurable for jewellery, hotels, restaurants, real estate and more' },
  { icon: PhoneCall, text: 'Handles enquiries, bookings, cancellations and status lookups' },
  { icon: Plug2, text: 'Executes real actions through connected business tools' },
  { icon: ShieldCheck, text: 'Escalates to a human the moment confidence drops' },
]

const WORKFLOW_STEPS = [
  { step: '01', title: 'Configure', description: 'Set up an AI Employee with your business profile, knowledge and tone — no code required.' },
  { step: '02', title: 'Connect', description: 'Link calendars, CRM, telephony and other systems the employee needs to get work done.' },
  { step: '03', title: 'Deploy', description: 'Activate across voice, chat and email with a test run before it ever talks to a customer.' },
  { step: '04', title: 'Govern', description: 'Review approvals, monitor escalations and keep a full audit trail of every action.' },
]

const INTEGRATIONS = [
  { icon: Calendar, label: 'Calendar' },
  { icon: ClipboardCheck, label: 'ATS' },
  { icon: Landmark, label: 'CRM' },
  { icon: PhoneCall, label: 'Telephony' },
  { icon: Mail, label: 'Email' },
  { icon: Brain, label: 'Custom API' },
]

export default function HomePage() {
  const { openDemoRequest } = useLeadFlow()

  return (
    <div className="min-h-screen bg-ink-25">
      <MarketingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[560px] bg-gradient-to-b from-brand-50/80 via-ink-25 to-ink-25" />
        <div className="glow-pulse pointer-events-none absolute left-1/2 top-[-120px] -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-600/10 blur-[120px]" />
        {/* extremely subtle grid + drifting light trails — decorative only, hidden on small screens to keep mobile light */}
        <div
          className="bg-grid-pan pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[560px] opacity-[0.05] sm:block"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[560px] overflow-hidden sm:block">
          <span className="light-trail absolute left-[10%] top-[18%] h-px w-1/3 bg-gradient-to-r from-transparent via-brand-600/50 to-transparent blur-[1px]" style={{ animationDelay: '0s' }} />
          <span className="light-trail absolute left-[45%] top-[38%] h-px w-1/4 bg-gradient-to-r from-transparent via-brand-500/40 to-transparent blur-[1px]" style={{ animationDelay: '3.2s' }} />
          <span className="light-trail absolute left-[20%] top-[58%] h-px w-1/3 bg-gradient-to-r from-transparent via-brand-600/30 to-transparent blur-[1px]" style={{ animationDelay: '6s' }} />
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-2 lg:pt-24">
          <div>
            <Badge tone="brand" className="hero-reveal uppercase tracking-wide" style={{ animationDelay: '0ms' }}>
              AI Workforce for the Modern Enterprise
            </Badge>
            <h1 className="mt-5 text-[40px] font-bold leading-[1.08] tracking-tight text-ink-900 sm:text-[52px]">
              <span className="hero-reveal block" style={{ animationDelay: '120ms' }}>Hire AI Employees.</span>
              <span className="hero-reveal block text-brand-600" style={{ animationDelay: '240ms' }}>Scale Your Business.</span>
            </h1>
            <p className="hero-reveal mt-5 max-w-lg text-[16px] leading-relaxed text-ink-600" style={{ animationDelay: '360ms' }}>
              JEXA.AI is your AI Workforce Operating System. Deploy intelligent AI employees that work across voice,
              chat, email and your business systems — with human oversight and enterprise-grade governance.
            </p>
            <div className="hero-reveal mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: '460ms' }}>
              <a href="#hr-employee">
                <Button size="lg" iconRight={<ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />}>
                  Get Started Free
                </Button>
              </a>
              <a href="#platform">
                <Button size="lg" variant="outline" icon={<ListChecks className="size-4" />}>
                  See How It Works
                </Button>
              </a>
            </div>
            <div className="hero-reveal mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-ink-500" style={{ animationDelay: '560ms' }}>
              {['No Credit Card', 'Quick Setup', 'Enterprise Ready'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-brand-600" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="hero-reveal mx-auto w-full max-w-md pr-4 lg:pr-0" style={{ animationDelay: '260ms' }}>
            <DashboardPreview />
          </div>
        </div>

        {/* Trusted by */}
        <div className="border-y border-ink-100 bg-ink-25 py-8">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-ink-400">
              Trusted by innovative companies
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
              {TRUSTED_BY.map((name, i) => (
                <Reveal key={name} delay={i * 60} className="!duration-500">
                  <span className="text-[13px] font-bold tracking-wide text-ink-300">{name}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 90}>
              <div className="group h-full rounded-2xl border border-ink-200 bg-surface p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-600/60 hover:bg-surface-elevated hover:shadow-glow-red">
                <div className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-transform duration-300 ease-out group-hover:scale-110">
                  <b.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-ink-900">{b.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">{b.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* AI Employee concept */}
      <section id="hr-employee" className="bg-ink-25 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge tone="neutral">The AI Employee Concept</Badge>
            <h2 className="mt-4 text-[32px] font-bold tracking-tight text-ink-900">
              Not a chatbot. A deployable member of your team.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
              Every JEXA.AI employee has a role, a status, KPIs and configured permissions — just like a human hire.
              JEXA.AI ships with two AI employees today, built to be extended over time.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Reveal className="rounded-2xl border border-ink-200 bg-surface p-8 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <Users className="size-5" />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-ink-900">Jexa HR</h3>
                  <p className="text-[13px] text-ink-500">Recruiting & Interview Copilot</p>
                </div>
              </div>
              <p className="mt-4 text-[13.5px] leading-relaxed text-ink-600">
                Screens candidates, conducts structured AI interviews and schedules human interviews — with every
                score backed by visible evidence.
              </p>
              <ul className="mt-5 space-y-3">
                {HR_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-[13.5px] text-ink-700">
                    <f.icon className="mt-0.5 size-4 shrink-0 text-brand-600" />
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link to="/ai-employees/hr" className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-600 hover:text-brand-700">
                Explore Jexa HR <ArrowRight className="size-3.5" />
              </Link>
            </Reveal>

            <Reveal id="voice-employee" delay={120} className="rounded-2xl border border-ink-200 bg-surface p-8 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-info-100 text-info-600">
                  <Mic className="size-5" />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-ink-900">Jaan</h3>
                  <p className="text-[13px] text-ink-500">Talks. Understands. Takes Action.</p>
                </div>
              </div>
              <p className="mt-4 text-[13.5px] leading-relaxed text-ink-600">
                Handles customer conversations, enquiries, bookings and support — reconfigured per industry without
                a separate codebase.
              </p>
              <ul className="mt-5 space-y-3">
                {VOICE_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-[13.5px] text-ink-700">
                    <f.icon className="mt-0.5 size-4 shrink-0 text-info-600" />
                    {f.text}
                  </li>
                ))}
              </ul>
              <Link to="/ai-employees/voice" className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-600 hover:text-brand-700">
                Explore Jaan <ArrowRight className="size-3.5" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Business workflow */}
      <section id="platform" className="mx-auto max-w-7xl px-6 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge tone="neutral">How JEXA.AI Works</Badge>
          <h2 className="mt-4 text-[32px] font-bold tracking-tight text-ink-900">From configuration to a governed AI workforce</h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW_STEPS.map((s, i) => (
            <Reveal key={s.step} delay={i * 90} className="relative">
              <span className="text-[13px] font-bold text-brand-600">{s.step}</span>
              <h3 className="mt-2 text-[16px] font-semibold text-ink-900">{s.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">{s.description}</p>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div className="absolute right-[-16px] top-2 hidden h-px w-8 bg-ink-200 lg:block" />
              )}
            </Reveal>
          ))}
        </div>
      </section>

      {/* Integrations concept */}
      <section id="company-brain" className="bg-ink-25 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <Badge tone="neutral">Company Brain & Integrations</Badge>
              <h2 className="mt-4 text-[30px] font-bold tracking-tight text-ink-900">
                Employees that know your business and act on real systems
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-600">
                Company Brain gives every AI employee a shared, governed source of knowledge. Connected integrations
                let them take real action — booking a slot, pulling a candidate's status, or updating a CRM record —
                instead of just describing what should happen.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[13.5px] text-ink-500">
                <MessageSquare className="size-4 text-brand-600" />
                Every source and integration is scoped to the employees you approve.
              </div>
            </Reveal>
            <div className="grid grid-cols-3 gap-4">
              {INTEGRATIONS.map((integration, i) => (
                <Reveal key={integration.label} delay={i * 60} className="flex flex-col items-center gap-2.5 rounded-xl border border-ink-200 bg-surface py-6 shadow-card transition-colors duration-300 hover:border-brand-600/50">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <integration.icon className="size-5" />
                  </div>
                  <span className="text-[12.5px] font-medium text-ink-700">{integration.label}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Governance */}
      <section id="governance" className="mx-auto max-w-7xl px-6 py-20">
        <Reveal className="rounded-2xl border border-ink-200 bg-surface p-10 shadow-card lg:p-14">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-success-100 text-success-600">
                <ShieldCheck className="size-5" />
              </div>
              <h2 className="mt-5 text-[28px] font-bold tracking-tight text-ink-900">Human oversight, built in — not bolted on</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-600">
                Every AI employee operates inside clear guardrails. High-stakes actions route to an approval queue,
                every decision carries visible evidence, and a complete audit trail is always one click away.
              </p>
            </div>
            <div className="space-y-3">
              {[
                'AI provides job-related evidence and recommendations — final employment decisions remain with authorized humans.',
                'Consequential actions require explicit human approval before they take effect.',
                'Every escalation clearly explains why the AI handed off, and to whom.',
              ].map((point, i) => (
                <Reveal key={point} delay={i * 90} className="flex items-start gap-3 rounded-xl bg-ink-25 p-4">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-600" />
                  <p className="text-[13.5px] leading-relaxed text-ink-700">{point}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <Reveal className="relative overflow-hidden rounded-2xl border border-ink-200 bg-surface-elevated px-8 py-14 text-center shadow-glow-red sm:px-16">
          <div className="glow-pulse pointer-events-none absolute left-1/2 top-0 -z-0 h-64 w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/20 blur-[100px]" />
          <div className="relative">
            <h2 className="text-[28px] font-bold tracking-tight text-ink-900 sm:text-[34px]">
              Ready to hire your first AI Employee?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] text-ink-500">
              Set up JEXA.AI in minutes with realistic mock data, then connect your real systems when you're ready.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#hr-employee">
                <Button size="lg" iconRight={<ArrowRight className="size-4" />}>
                  Get Started Free
                </Button>
              </a>
              <Button size="lg" variant="outline" onClick={() => openDemoRequest('hr')}>
                Book a Demo
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <MarketingFooter />
    </div>
  )
}
