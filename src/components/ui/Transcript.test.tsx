import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Transcript } from './Transcript'
import type { TranscriptTurn } from '@/types'

describe('Transcript', () => {
  it('renders an empty state without crashing', () => {
    render(<Transcript turns={[]} />)
    expect(screen.getByText('No transcript available.')).toBeInTheDocument()
  })

  it('renders a custom empty label', () => {
    render(<Transcript turns={[]} emptyLabel="Nothing here." />)
    expect(screen.getByText('Nothing here.')).toBeInTheDocument()
  })

  it('renders user, assistant, tool, and system turns without crashing', () => {
    const turns: TranscriptTurn[] = [
      { id: 't1', speaker: 'customer', text: 'Hello, is anyone there?' },
      { id: 't2', speaker: 'assistant', text: 'Hi! How can I help?' },
      { id: 't3', speaker: 'tool', text: 'lookup_order({"id": 42})' },
      { id: 't4', speaker: 'system', text: 'Call transferred.' },
    ]
    render(<Transcript turns={turns} />)
    expect(screen.getByText('Hello, is anyone there?')).toBeInTheDocument()
    expect(screen.getByText('Hi! How can I help?')).toBeInTheDocument()
    expect(screen.getByText('lookup_order({"id": 42})')).toBeInTheDocument()
    expect(screen.getByText('Call transferred.')).toBeInTheDocument()
  })

  it('renders a turn with a missing/undefined role without crashing', () => {
    const turns = [{ id: 't1', text: 'No role on this one.' }] as unknown as TranscriptTurn[]
    render(<Transcript turns={turns} />)
    expect(screen.getByText('No role on this one.')).toBeInTheDocument()
  })

  it('renders a turn with an unrecognized future role without crashing or hiding it', () => {
    const turns: TranscriptTurn[] = [{ id: 't1', speaker: 'supervisor', text: 'Escalating now.' }]
    render(<Transcript turns={turns} />)
    expect(screen.getByText('Escalating now.')).toBeInTheDocument()
  })

  it('renders a malformed item (missing id and text) without crashing', () => {
    const turns = [{ speaker: 'assistant' }] as unknown as TranscriptTurn[]
    const { container } = render(<Transcript turns={turns} />)
    expect(container).toBeTruthy()
  })

  it('never throws for any historical or unexpected speaker value', () => {
    const values = ['assistant', 'customer', 'user', 'agent', 'ai', 'candidate', 'system', 'tool', undefined, null, '', 'anything-else']
    for (const speaker of values) {
      const turns = [{ id: 'x', speaker, text: 'x' }] as unknown as TranscriptTurn[]
      expect(() => render(<Transcript turns={turns} />)).not.toThrow()
    }
  })
})
