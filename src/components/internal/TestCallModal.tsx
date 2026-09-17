import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Room, RoomEvent, Track, type RemoteTrack } from 'livekit-client'
import {
  Bot,
  ChevronDown,
  Globe,
  Loader2,
  Maximize2,
  Minimize2,
  Phone,
  PhoneCall,
  PhoneOff,
  Send,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  X,
  XCircle,
} from 'lucide-react'
import type { VoiceAgent } from '@/types'
import { voiceAgentBuilderService } from '@/services/api'
import { useOutboundNumbers } from '@/hooks/useVoiceAgentBuilder'
import { cn } from '@/utils/cn'

const COUNTRY_CODES = [
  { code: 'IN', flag: '🇮🇳', dial: '+91', name: 'India' },
  { code: 'US', flag: '🇺🇸', dial: '+1', name: 'United States' },
  { code: 'GB', flag: '🇬🇧', dial: '+44', name: 'United Kingdom' },
  { code: 'AE', flag: '🇦🇪', dial: '+971', name: 'UAE' },
  { code: 'SG', flag: '🇸🇬', dial: '+65', name: 'Singapore' },
  { code: 'AU', flag: '🇦🇺', dial: '+61', name: 'Australia' },
  { code: 'CA', flag: '🇨🇦', dial: '+1', name: 'Canada' },
  { code: 'DE', flag: '🇩🇪', dial: '+49', name: 'Germany' },
]

const SAMPLE_CONTEXTS = [
  { firstName: 'John', orderId: 'acme-48213' },
  { firstName: 'Sarah', accountId: 'acc-99201', plan: 'Enterprise' },
  { customerName: 'Priya', ticketId: 'TICK-4402', priority: 'High' },
  { callerName: 'Alex', appointmentDate: '2026-09-20', service: 'Consultation' },
]

// Real dial status returned by the backend (start-test-call) — "initiated"
// means CallService.start_call got back a real SIP participant (a phone
// should actually ring), "ready" means only the LiveKit room/agent were
// created because no destination number was requested (not used on this
// tab — the phone tab always sends one), and "failed" means a destination
// number was requested but the real SIP dial did not succeed (e.g. no SIP
// trunk configured) — surfaced with the backend's real dialError, never
// silently upgraded to "dialed". There is no live "answered" signal
// available yet (the Call model has no such state — see
// app/ai_employees/voice/models/call.py), so this UI never fakes a
// "connected" transition for the phone tab.
type PhoneCallState = 'idle' | 'placing' | 'dialed' | 'no_dial' | 'failed' | 'error'
type WebCallState = 'idle' | 'connecting' | 'connected' | 'error' | 'ended'

interface Props {
  open: boolean
  onClose: () => void
  agent: VoiceAgent
}

export function TestCallModal({ open, onClose, agent }: Props) {
  const [activeTab, setActiveTab] = useState<'call' | 'web' | 'chat'>('call')

  const [selectedVersion, setSelectedVersion] = useState<'live' | 'draft'>(
    agent.status === 'live' ? 'live' : 'draft',
  )
  const [versionDropdownOpen, setVersionDropdownOpen] = useState(false)

  const [contextJson, setContextJson] = useState<string>(JSON.stringify(SAMPLE_CONTEXTS[0], null, 2))
  const [expandedContext, setExpandedContext] = useState(false)

  // Phone Call Tab State
  const outboundNumbers = useOutboundNumbers()
  const [selectedAgentNumber, setSelectedAgentNumber] = useState('')
  const [agentNumberDropdownOpen, setAgentNumberDropdownOpen] = useState(false)
  const [country, setCountry] = useState(COUNTRY_CODES[0])
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [userNumber, setUserNumber] = useState('')

  const [phoneState, setPhoneState] = useState<PhoneCallState>('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [callId, setCallId] = useState('')

  // Web Call State — real LiveKit WebRTC connection, not simulated.
  const [webCallState, setWebCallState] = useState<WebCallState>('idle')
  const [webElapsedSeconds, setWebElapsedSeconds] = useState(0)
  const [webErrorMsg, setWebErrorMsg] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const roomRef = useRef<Room | null>(null)
  const remoteAudioContainerRef = useRef<HTMLDivElement>(null)

  // Chat Simulation State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent' | 'error'; text: string }>>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const phoneTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const webTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countryRef = useRef<HTMLDivElement>(null)
  const versionRef = useRef<HTMLDivElement>(null)
  const agentNumberRef = useRef<HTMLDivElement>(null)

  // Default to the first real configured number once it loads — never a
  // fabricated placeholder. Re-syncs if the list changes (e.g. after the
  // deployment configures VOICE_OUTBOUND_CALLER_ID and this is re-opened).
  useEffect(() => {
    const numbers = outboundNumbers.data ?? []
    if (numbers.length > 0 && !numbers.some((n) => n.number === selectedAgentNumber)) {
      setSelectedAgentNumber(numbers[0].number)
    } else if (numbers.length === 0 && selectedAgentNumber) {
      setSelectedAgentNumber('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outboundNumbers.data])

  // Reset/synchronize on open — always tears down any live LiveKit
  // connection when the modal closes, never leaves a hot mic behind.
  useEffect(() => {
    if (!open) {
      if (phoneTimerRef.current) clearInterval(phoneTimerRef.current)
      if (webTimerRef.current) clearInterval(webTimerRef.current)
      void roomRef.current?.disconnect()
      roomRef.current = null
      setPhoneState('idle')
      setWebCallState('idle')
      setElapsedSeconds(0)
      setWebElapsedSeconds(0)
      setErrorMsg('')
      setWebErrorMsg('')
      setCallId('')
    } else {
      setSelectedVersion(agent.status === 'live' ? 'live' : 'draft')
      if (chatMessages.length === 0) {
        setChatMessages([
          { sender: 'agent', text: agent.promptConfig.introMessage || `Hello! I'm ${agent.name}. How can I help you today?` },
        ])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, agent.id])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryDropdownOpen(false)
      if (versionRef.current && !versionRef.current.contains(e.target as Node)) setVersionDropdownOpen(false)
      if (agentNumberRef.current && !agentNumberRef.current.contains(e.target as Node)) setAgentNumberDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (phoneState === 'dialed') {
      phoneTimerRef.current = setInterval(() => setElapsedSeconds((d) => d + 1), 1000)
    } else {
      if (phoneTimerRef.current) clearInterval(phoneTimerRef.current)
      if (phoneState === 'idle') setElapsedSeconds(0)
    }
    return () => {
      if (phoneTimerRef.current) clearInterval(phoneTimerRef.current)
    }
  }, [phoneState])

  useEffect(() => {
    if (webCallState === 'connected') {
      webTimerRef.current = setInterval(() => setWebElapsedSeconds((d) => d + 1), 1000)
    } else {
      if (webTimerRef.current) clearInterval(webTimerRef.current)
      if (webCallState === 'idle') setWebElapsedSeconds(0)
    }
    return () => {
      if (webTimerRef.current) clearInterval(webTimerRef.current)
    }
  }, [webCallState])

  const handleGenerateContext = () => {
    const nextIdx = Math.floor(Math.random() * SAMPLE_CONTEXTS.length)
    setContextJson(JSON.stringify(SAMPLE_CONTEXTS[nextIdx], null, 2))
  }

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function parsedContext(): Record<string, unknown> {
    try {
      return JSON.parse(contextJson)
    } catch {
      return {}
    }
  }

  const fullDialNumber = `${country.dial}${userNumber.replace(/\D/g, '')}`
  const canStartCall = userNumber.trim().length >= 7 && phoneState === 'idle'
  const useDraft = selectedVersion === 'draft' || agent.status !== 'live'

  async function handleStartPhoneCall() {
    setPhoneState('placing')
    setErrorMsg('')
    try {
      // VoiceAgent.assignedPhoneNumberId is an internal Telephony-domain
      // record ID, never a dialable E.164 number — it must never be sent
      // as a caller ID. selectedAgentNumber instead comes from the real
      // GET /outbound-numbers list (ultimately VOICE_OUTBOUND_CALLER_ID);
      // if that's empty the backend falls back to its own configured
      // caller ID (and honestly reports dialStatus: "failed" if that's
      // also unset, rather than pretending the call was placed).
      const res = await voiceAgentBuilderService.startTestCall(agent.id, {
        userNumber: fullDialNumber,
        agentNumber: selectedAgentNumber || undefined,
        useDraft,
        contextVariables: parsedContext(),
        callType: 'phone',
      })
      setCallId(res.callId)
      if (res.dialStatus === 'initiated') {
        setPhoneState('dialed')
      } else if (res.dialStatus === 'failed') {
        setErrorMsg(res.dialError || 'The outbound call could not be placed.')
        setPhoneState('failed')
      } else {
        setPhoneState('no_dial')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to place test call')
      setPhoneState('error')
    }
  }

  function handleEndPhoneCall() {
    setPhoneState('idle')
  }

  // Real WebRTC connection via livekit-client — joins the actual LiveKit
  // room the backend created, publishes the browser microphone, and plays
  // back whatever audio the agent's configured Realtime/TTS provider
  // produces. No simulated "connected" state.
  async function handleStartWebCall() {
    setWebCallState('connecting')
    setWebErrorMsg('')
    try {
      const res = await voiceAgentBuilderService.startTestCall(agent.id, {
        useDraft,
        contextVariables: parsedContext(),
        callType: 'web',
      })

      const room = new Room()
      roomRef.current = room

      room.on(RoomEvent.Disconnected, () => {
        setWebCallState((prev) => (prev === 'error' ? prev : 'ended'))
      })
      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio && remoteAudioContainerRef.current) {
          const el = track.attach()
          remoteAudioContainerRef.current.appendChild(el)
        }
      })

      await room.connect(res.livekitUrl, res.token)
      await room.localParticipant.setMicrophoneEnabled(true)
      setCallId(res.callId)
      setWebCallState('connected')
    } catch (err) {
      setWebErrorMsg(
        err instanceof Error
          ? err.message
          : 'Could not connect — check microphone permissions and that LIVEKIT_URL is configured.',
      )
      setWebCallState('error')
      await roomRef.current?.disconnect()
      roomRef.current = null
    }
  }

  async function handleEndWebCall() {
    await roomRef.current?.disconnect()
    roomRef.current = null
    if (remoteAudioContainerRef.current) remoteAudioContainerRef.current.innerHTML = ''
    setWebCallState('ended')
  }

  function toggleMute() {
    const next = !isMuted
    setIsMuted(next)
    void roomRef.current?.localParticipant.setMicrophoneEnabled(!next)
  }

  async function handleSendChatMessage(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!chatInput.trim() || chatLoading) return

    const userText = chatInput.trim()
    setChatInput('')
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }])
    setChatLoading(true)

    try {
      const res = await voiceAgentBuilderService.sendTestMessage(agent.id, userText)
      setChatMessages((prev) => [...prev, { sender: 'agent', text: res.agentTurn.text }])
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'error', text: err instanceof Error ? err.message : 'The agent could not respond to that message.' },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full overflow-hidden rounded-2xl border border-[#232733] bg-[#0c0e12] text-white shadow-2xl transition-all',
          expandedContext ? 'max-w-5xl' : 'max-w-[880px]',
        )}
      >
        <div className="flex items-center justify-between border-b border-[#1c202b] px-6 py-4">
          <h2 className="text-[17px] font-semibold text-white tracking-tight">Test agent</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row min-h-[460px]">
          <div className="w-full md:w-[340px] shrink-0 border-b md:border-b-0 md:border-r border-[#1c202b] p-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Agent</label>
              <div className="flex h-10 items-center justify-between rounded-xl border border-[#232836] bg-[#141720] px-3.5 text-sm text-white">
                <div className="flex items-center gap-2">
                  <div className="flex size-5 items-center justify-center rounded-md bg-white/10 text-zinc-300">
                    <Bot className="size-3.5" />
                  </div>
                  <span className="font-medium text-white">{agent.name}</span>
                </div>
              </div>
            </div>

            <div ref={versionRef} className="relative">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Version</label>
              <button
                type="button"
                onClick={() => setVersionDropdownOpen((v) => !v)}
                className="flex h-10 w-full items-center justify-between rounded-xl border border-[#232836] bg-[#141720] px-3.5 text-sm text-white hover:border-[#303749] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={cn('size-2 rounded-full', selectedVersion === 'live' ? 'bg-emerald-400' : 'bg-amber-400')} />
                  <span className="font-medium capitalize">{selectedVersion}</span>
                  {selectedVersion === 'draft' && (
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">Editable</span>
                  )}
                </div>
                <ChevronDown className="size-4 text-zinc-500" />
              </button>

              {versionDropdownOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-[#282d3d] bg-[#141720] p-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => { setSelectedVersion('live'); setVersionDropdownOpen(false) }}
                    className={cn('flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors', selectedVersion === 'live' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white')}
                  >
                    <span className="size-2 rounded-full bg-emerald-400" />
                    <span>Live</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedVersion('draft'); setVersionDropdownOpen(false) }}
                    className={cn('flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors', selectedVersion === 'draft' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white')}
                  >
                    <span className="size-2 rounded-full bg-amber-400" />
                    <span>Draft (Current changes)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Context variables</label>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={handleGenerateContext} className="flex items-center gap-1 rounded-md border border-[#2a3040] bg-[#1a1e28] px-2 py-1 text-[11px] font-medium text-zinc-300 hover:bg-[#232836] hover:text-white transition-colors">
                    <Sparkles className="size-3 text-brand-400" />
                    Generate
                  </button>
                  <button type="button" onClick={() => setExpandedContext((e) => !e)} className="rounded p-1 text-zinc-400 hover:bg-white/5 hover:text-white" title={expandedContext ? 'Collapse' : 'Expand'}>
                    {expandedContext ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                  </button>
                </div>
              </div>
              <textarea
                value={contextJson}
                onChange={(e) => setContextJson(e.target.value)}
                rows={expandedContext ? 12 : 7}
                spellCheck={false}
                className="w-full rounded-xl border border-[#232836] bg-[#141720] p-3 font-mono text-[12.5px] text-emerald-400 outline-none focus:border-brand-500/60 transition-colors resize-none selection:bg-brand-500/30"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center gap-8 border-b border-[#1c202b] pb-2.5">
              <button type="button" onClick={() => setActiveTab('call')} className={cn('flex items-center gap-2 text-sm font-medium transition-colors pb-2 -mb-2.5', activeTab === 'call' ? 'border-b-2 border-white text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200')}>
                <PhoneCall className="size-4" />
                Call
              </button>
              <button type="button" onClick={() => setActiveTab('web')} className={cn('flex items-center gap-2 text-sm font-medium transition-colors pb-2 -mb-2.5', activeTab === 'web' ? 'border-b-2 border-white text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200')}>
                <Globe className="size-4" />
                Web
              </button>
              <button type="button" onClick={() => setActiveTab('chat')} className={cn('flex items-center gap-2 text-sm font-medium transition-colors pb-2 -mb-2.5', activeTab === 'chat' ? 'border-b-2 border-white text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200')}>
                <Send className="size-4" />
                Chat
              </button>
            </div>

            {activeTab === 'call' && (
              <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-4 space-y-5">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-semibold text-white">Get a test call on your number</h3>
                  <p className="text-xs text-zinc-400">We place a real outbound call to your number using the context variables above.</p>
                </div>

                <div ref={agentNumberRef} className="relative">
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Agent number</label>
                  {outboundNumbers.loading ? (
                    <div className="flex h-11 w-full items-center rounded-xl border border-[#232836] bg-[#141720] px-3.5 text-sm text-zinc-500">Loading…</div>
                  ) : (outboundNumbers.data ?? []).length === 0 ? (
                    <>
                      <div className="flex h-11 w-full items-center rounded-xl border border-[#232836] bg-[#141720] px-3.5 text-sm text-zinc-500">No number configured</div>
                      <p className="mt-1 text-[11px] text-zinc-500">Set VOICE_OUTBOUND_CALLER_ID for this deployment to enable real test calls.</p>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setAgentNumberDropdownOpen((v) => !v)}
                        className="flex h-11 w-full items-center justify-between rounded-xl border border-[#232836] bg-[#141720] px-3.5 text-sm font-mono text-white hover:border-[#303749] transition-colors"
                      >
                        {selectedAgentNumber}
                        {(outboundNumbers.data ?? []).length > 1 && <ChevronDown className="size-4 shrink-0 text-zinc-500" />}
                      </button>
                      {agentNumberDropdownOpen && (outboundNumbers.data ?? []).length > 1 && (
                        <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-[#282d3d] bg-[#141720] p-1 shadow-xl">
                          {(outboundNumbers.data ?? []).map((n) => (
                            <button
                              key={n.number}
                              type="button"
                              onClick={() => { setSelectedAgentNumber(n.number); setAgentNumberDropdownOpen(false) }}
                              className={cn('flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-mono transition-colors', n.number === selectedAgentNumber ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white')}
                            >
                              <span>{n.number}</span>
                              <span className="font-sans text-zinc-500">{n.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-zinc-300">User number</label>
                  <div className="flex h-11 items-stretch rounded-xl border border-[#232836] bg-[#141720] focus-within:border-brand-500 transition-colors">
                    <div ref={countryRef} className="relative flex shrink-0">
                      <button type="button" onClick={() => setCountryDropdownOpen((v) => !v)} className="flex h-full items-center gap-1.5 border-r border-[#232836] px-3 text-sm text-white hover:bg-white/5 transition-colors">
                        <span className="text-base">{country.flag}</span>
                        <ChevronDown className="size-3.5 text-zinc-500" />
                      </button>
                      {countryDropdownOpen && (
                        <div className="absolute left-0 top-full z-30 mt-1 max-h-56 w-56 overflow-auto rounded-xl border border-[#282d3d] bg-[#141720] p-1 shadow-2xl">
                          {COUNTRY_CODES.map((c) => (
                            <button key={c.code} type="button" onClick={() => { setCountry(c); setCountryDropdownOpen(false) }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors">
                              <span className="text-base">{c.flag}</span>
                              <span className="flex-1 text-white">{c.name}</span>
                              <span className="font-mono text-zinc-400">{c.dial}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 items-center px-3 gap-2">
                      <span className="font-mono text-sm text-zinc-400 select-none">{country.dial}</span>
                      <input
                        type="tel"
                        value={userNumber}
                        onChange={(e) => setUserNumber(e.target.value)}
                        placeholder="98765 43210"
                        disabled={phoneState !== 'idle' && phoneState !== 'error' && phoneState !== 'no_dial' && phoneState !== 'failed'}
                        className="flex-1 bg-transparent font-mono text-sm text-white placeholder:text-zinc-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {phoneState === 'placing' && (
                  <div className="flex items-center gap-3 rounded-xl border border-brand-500/30 bg-brand-950/40 px-4 py-3 text-xs text-brand-300">
                    <Loader2 className="size-4 animate-spin shrink-0 text-brand-400" />
                    <span>Placing outbound call via LiveKit SIP trunk…</span>
                  </div>
                )}

                {phoneState === 'dialed' && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-3 text-xs text-amber-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Phone className="size-4 shrink-0 text-amber-400" />
                        <span className="font-semibold text-amber-200">Dialing {fullDialNumber}…</span>
                      </div>
                      <span className="font-mono text-amber-300">{formatTimer(elapsedSeconds)}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-amber-400/80">
                      Answer your phone to speak with {agent.name}. This screen doesn't show live pickup/hangup status —
                      just hang up your phone when you're done testing.
                    </p>
                  </div>
                )}

                {phoneState === 'no_dial' && (
                  <div className="rounded-xl border border-[#282d3d] bg-[#141720] px-4 py-3 text-xs text-zinc-300">
                    <p className="font-semibold text-zinc-200">Room created, but no phone was dialed.</p>
                    <p className="mt-1 text-zinc-400">
                      No destination number was sent with this request, so only a LiveKit room + agent dispatch was created (call ID:{' '}
                      <span className="font-mono">{callId}</span>).
                    </p>
                  </div>
                )}

                {phoneState === 'failed' && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-xs text-rose-300">
                    <div className="flex items-center gap-2">
                      <XCircle className="size-4 shrink-0 text-rose-400" />
                      <p className="font-semibold text-rose-200">The outbound call was never placed — your phone did not ring.</p>
                    </div>
                    <p className="mt-1.5 break-all text-rose-300/90">{errorMsg}</p>
                    <p className="mt-1.5 text-rose-400/70">
                      Configure VOICE_SIP_TRUNK_ID / VOICE_OUTBOUND_CALLER_ID for this deployment, or use the Web tab instead. (call ID: <span className="font-mono">{callId}</span>)
                    </p>
                    <button type="button" onClick={() => setPhoneState('idle')} className="mt-2 font-medium text-rose-200 hover:underline">Retry</button>
                  </div>
                )}

                {phoneState === 'error' && (
                  <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-xs text-rose-300">
                    <div className="flex items-center gap-2">
                      <XCircle className="size-4 shrink-0 text-rose-400" />
                      <span className="break-all">{errorMsg || 'Could not place test call.'}</span>
                    </div>
                    <button type="button" onClick={() => setPhoneState('idle')} className="shrink-0 font-medium text-rose-200 hover:underline ml-2">Retry</button>
                  </div>
                )}

                {phoneState === 'dialed' ? (
                  <button type="button" onClick={handleEndPhoneCall} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 font-semibold text-sm text-white shadow-lg shadow-rose-950/50 hover:bg-rose-700 active:scale-[0.99] transition-all">
                    <PhoneOff className="size-4" />
                    Close
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canStartCall}
                    onClick={handleStartPhoneCall}
                    className={cn('flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all', canStartCall ? 'bg-brand-600 text-white hover:bg-brand-500 active:scale-[0.99] cursor-pointer' : 'bg-[#252833] text-zinc-500 cursor-not-allowed')}
                  >
                    <PhoneCall className="size-4" />
                    Start phone call
                  </button>
                )}
              </div>
            )}

            {activeTab === 'web' && (
              <div className="flex-1 flex flex-col justify-center items-center text-center max-w-md mx-auto w-full py-6 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-white">Test call in your browser</h3>
                  <p className="text-xs text-zinc-400">Talk directly to {agent.name} through your browser microphone and speakers.</p>
                </div>

                <div className="flex size-24 items-center justify-center rounded-full border border-[#282e3e] bg-[#141720] shadow-inner relative">
                  {webCallState === 'connected' ? (
                    <>
                      <div className="absolute inset-0 rounded-full border border-brand-500/50 animate-ping opacity-25" />
                      <Volume2 className="size-8 text-brand-400 animate-pulse" />
                    </>
                  ) : (
                    <Globe className="size-8 text-zinc-500" />
                  )}
                </div>

                {/* Real remote audio plays through these dynamically-attached elements. */}
                <div ref={remoteAudioContainerRef} className="hidden" />

                {webCallState === 'connected' && (
                  <div className="space-y-1">
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-mono text-xs font-semibold text-emerald-300">LIVE • {formatTimer(webElapsedSeconds)}</span>
                    <p className="text-xs text-zinc-400">Connected via WebRTC — your microphone is live.</p>
                  </div>
                )}

                {webCallState === 'error' && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-xs text-rose-300">
                    <XCircle className="size-4 shrink-0" />
                    <span className="break-all">{webErrorMsg}</span>
                  </div>
                )}

                {webCallState === 'idle' && (
                  <button type="button" onClick={handleStartWebCall} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-sm text-white hover:bg-brand-500 active:scale-[0.99] transition-all shadow-lg shadow-brand-950/50">
                    <Phone className="size-4" />
                    Start web call
                  </button>
                )}

                {webCallState === 'error' && (
                  <button type="button" onClick={handleStartWebCall} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#252833] text-sm font-medium text-white hover:bg-[#2c3140] transition-all">
                    Retry
                  </button>
                )}

                {webCallState === 'connecting' && (
                  <button type="button" disabled className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#252833] text-sm text-zinc-400">
                    <Loader2 className="size-4 animate-spin" />
                    Connecting to audio room…
                  </button>
                )}

                {webCallState === 'connected' && (
                  <div className="flex w-full gap-3">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className={cn('flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#282e3e] text-sm font-medium transition-colors', isMuted ? 'bg-amber-500/20 text-amber-300' : 'bg-[#141720] text-zinc-300 hover:bg-[#1a1f2b]')}
                    >
                      {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                      {isMuted ? 'Unmute' : 'Mute'}
                    </button>
                    <button type="button" onClick={handleEndWebCall} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-semibold text-white hover:bg-rose-700 transition-colors">
                      <PhoneOff className="size-4" />
                      End call
                    </button>
                  </div>
                )}

                {webCallState === 'ended' && (
                  <button type="button" onClick={() => setWebCallState('idle')} className="text-xs font-medium text-brand-400 hover:underline">Start another web call</button>
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between h-[380px]">
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={cn('flex gap-2.5 max-w-[85%]', msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
                      <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold', msg.sender === 'user' ? 'bg-brand-600 text-white' : msg.sender === 'error' ? 'bg-rose-500/20 text-rose-300' : 'bg-[#232836] text-zinc-300')}>
                        {msg.sender === 'user' ? 'You' : msg.sender === 'error' ? <XCircle className="size-3.5" /> : <Bot className="size-3.5" />}
                      </div>
                      <div className={cn('rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed', msg.sender === 'user' ? 'bg-brand-600 text-white rounded-tr-sm' : msg.sender === 'error' ? 'bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-tl-sm' : 'bg-[#141720] border border-[#232836] text-zinc-200 rounded-tl-sm')}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Bot className="size-3.5 animate-pulse text-brand-400" />
                      <span>{agent.name} is typing…</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendChatMessage} className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type what the caller would say…"
                    className="flex-1 rounded-xl border border-[#232836] bg-[#141720] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-brand-500 transition-colors"
                  />
                  <button type="submit" disabled={!chatInput.trim() || chatLoading} className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 transition-colors">
                    <Send className="size-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
