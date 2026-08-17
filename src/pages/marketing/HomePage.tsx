import { Link } from 'react-router-dom'
import {
  ArrowRight,
  PlayCircle,
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
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-gradient-to-b from-brand-50/70 via-white to-white" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-2 lg:pt-24">
          <div>
            <Badge tone="brand" className="uppercase tracking-wide">
              AI Workforce for the Modern Enterprise
            </Badge>
            <h1 className="mt-5 text-[40px] font-bold leading-[1.08] tracking-tight text-ink-900 sm:text-[52px]">
              Hire AI Employees.
              <br />
              <span className="text-brand-600">Scale Your Business.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-ink-600">
              AIVRA is your AI Workforce Operating System. Deploy intelligent AI employees that work across voice,
              chat, email and your business systems — with human oversight and enterprise-grade governance.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" iconRight={<ArrowRight className="size-4" />}>
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" icon={<PlayCircle className="size-4" />}>
                Watch Overview
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-ink-500">
              {['No Credit Card', 'Quick Setup', 'Enterprise Ready'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success-600" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="mx-auto w-full max-w-md pr-4 lg:pr-0">
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
              {TRUSTED_BY.map((name) => (
                <span key={name} className="text-[13px] font-bold tracking-wide text-ink-300">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.title}>
              <div className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <b.icon className="size-5" />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-ink-900">{b.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Employee concept */}
      <section id="hr-employee" className="bg-ink-25 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="neutral">The AI Employee Concept</Badge>
            <h2 className="mt-4 text-[32px] font-bold tracking-tight text-ink-900">
              Not a chatbot. A deployable member of your team.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
              Every AIVRA employee has a role, a status, KPIs and configured permissions — just like a human hire.
              AIVRA ships with two AI employees today, built to be extended over time.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-ink-200 bg-white p-8 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <Users className="size-5" />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-ink-900">AI HR Employee</h3>
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
              <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-600 hover:text-brand-700">
                Explore AI HR Employee <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div id="voice-employee" className="rounded-2xl border border-ink-200 bg-white p-8 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-info-100 text-info-600">
                  <Mic className="size-5" />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-ink-900">AI Voice Employee</h3>
                  <p className="text-[13px] text-ink-500">Configurable Voice Concierge</p>
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
              <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-600 hover:text-brand-700">
                Explore AI Voice Employee <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Business workflow */}
      <section id="platform" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="neutral">How AIVRA Works</Badge>
          <h2 className="mt-4 text-[32px] font-bold tracking-tight text-ink-900">From configuration to a governed AI workforce</h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW_STEPS.map((s, i) => (
            <div key={s.step} className="relative">
              <span className="text-[13px] font-bold text-brand-300">{s.step}</span>
              <h3 className="mt-2 text-[16px] font-semibold text-ink-900">{s.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">{s.description}</p>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div className="absolute right-[-16px] top-2 hidden h-px w-8 bg-ink-200 lg:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Integrations concept */}
      <section id="company-brain" className="bg-ink-25 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
            <div>
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
            </div>
            <div className="grid grid-cols-3 gap-4">
              {INTEGRATIONS.map((integration) => (
                <div key={integration.label} className="flex flex-col items-center gap-2.5 rounded-xl border border-ink-200 bg-white py-6 shadow-card">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <integration.icon className="size-5" />
                  </div>
                  <span className="text-[12.5px] font-medium text-ink-700">{integration.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Governance */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-2xl border border-ink-200 bg-white p-10 shadow-card lg:p-14">
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
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-xl bg-ink-25 p-4">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success-600" />
                  <p className="text-[13.5px] leading-relaxed text-ink-700">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-2xl bg-brand-600 px-8 py-14 text-center sm:px-16">
          <h2 className="text-[28px] font-bold tracking-tight text-white sm:text-[34px]">
            Ready to hire your first AI Employee?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-brand-100">
            Set up AIVRA in minutes with realistic mock data, then connect your real systems when you're ready.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" variant="secondary" className="bg-white text-brand-700 hover:bg-brand-50">
              Get Started Free
            </Button>
            <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
              Book a Demo
            </Button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
