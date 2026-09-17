import { describe, expect, it } from 'vitest'
import { resolveTranscriptSpeaker } from './transcriptSpeaker'

describe('resolveTranscriptSpeaker', () => {
  it('resolves real Jaan worker roles', () => {
    expect(resolveTranscriptSpeaker('customer').kind).toBe('human')
    expect(resolveTranscriptSpeaker('assistant').kind).toBe('ai')
  })

  it('resolves HR-normalized roles', () => {
    expect(resolveTranscriptSpeaker('candidate').kind).toBe('human')
    expect(resolveTranscriptSpeaker('ai').kind).toBe('ai')
    expect(resolveTranscriptSpeaker('system').kind).toBe('system')
  })

  it('resolves the simulator role and historical duplicate-turn role', () => {
    expect(resolveTranscriptSpeaker('agent').kind).toBe('ai')
    expect(resolveTranscriptSpeaker('user').kind).toBe('human')
  })

  it('resolves tool/function roles', () => {
    expect(resolveTranscriptSpeaker('tool').kind).toBe('tool')
    expect(resolveTranscriptSpeaker('function').kind).toBe('tool')
  })

  it('is case- and whitespace-insensitive', () => {
    expect(resolveTranscriptSpeaker('  Assistant ').kind).toBe('ai')
    expect(resolveTranscriptSpeaker('CUSTOMER').kind).toBe('human')
  })

  it('falls back safely for a missing role', () => {
    const resolved = resolveTranscriptSpeaker(undefined)
    expect(resolved.kind).toBe('unknown')
    expect(resolved.icon).toBeTruthy()
    expect(resolved.label).toBe('Unknown speaker')
  })

  it('falls back safely for null', () => {
    const resolved = resolveTranscriptSpeaker(null)
    expect(resolved.kind).toBe('unknown')
  })

  it('falls back safely for an unrecognized future role, without hiding it', () => {
    const resolved = resolveTranscriptSpeaker('supervisor')
    expect(resolved.kind).toBe('unknown')
    expect(resolved.label).toContain('supervisor')
    expect(resolved.icon).toBeTruthy()
  })

  it('every branch returns a complete, usable config', () => {
    for (const raw of ['assistant', 'customer', 'system', 'tool', '', 'weird-value']) {
      const resolved = resolveTranscriptSpeaker(raw)
      expect(resolved.icon).toBeTruthy()
      expect(['left', 'right']).toContain(resolved.align)
      expect(resolved.bubbleClass.length).toBeGreaterThan(0)
      expect(resolved.avatarClass.length).toBeGreaterThan(0)
    }
  })
})
