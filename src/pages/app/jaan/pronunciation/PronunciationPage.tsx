import { useState } from 'react'
import { BookMarked, Plus, Trash2 } from 'lucide-react'
import { useSetBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { usePronunciationEntries, useTextNormalizationRules } from '@/hooks/useJaan'
import { jaanPronunciationService } from '@/services/api'
import { useToast } from '@/hooks/useToast'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Switch } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { SUPPORTED_LANGUAGES } from '@/services/mock/data/jaan/providerCatalog'
import { TEXT_NORMALIZATION_CATEGORY_LABEL } from '@/types'

function AddEntryModal({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const [word, setWord] = useState('')
  const [pronunciation, setPronunciation] = useState('')
  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0].code)
  const { show } = useToast()

  async function add() {
    if (!word.trim() || !pronunciation.trim()) return
    await jaanPronunciationService.addEntry({ word, pronunciation, language })
    show({ tone: 'success', title: 'Pronunciation added', description: word })
    onAdded()
    onClose()
    setWord('')
    setPronunciation('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Pronunciation" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={add}>Add</Button></>}>
      <div className="space-y-4">
        <div><Label required>Word</Label><Input value={word} onChange={(e) => setWord(e.target.value)} placeholder="e.g. Jaan" autoFocus /></div>
        <div><Label required>Pronunciation</Label><Input value={pronunciation} onChange={(e) => setPronunciation(e.target.value)} placeholder="e.g. JAAN (rhymes with on)" /></div>
        <div>
          <Label>Language</Label>
          <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {SUPPORTED_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </Select>
        </div>
      </div>
    </Modal>
  )
}

export default function PronunciationPage() {
  useSetBreadcrumbs([{ label: 'Jaan', href: '/app/jaan' }, { label: 'Pronunciation' }])
  const entries = usePronunciationEntries()
  const rules = useTextNormalizationRules()
  const { show } = useToast()
  const [modalOpen, setModalOpen] = useState(false)

  async function remove(id: string) {
    await jaanPronunciationService.removeEntry(id)
    entries.refetch()
  }

  async function toggleRule(id: string, enabled: boolean) {
    await jaanPronunciationService.toggleNormalizationRule(id, enabled)
    rules.refetch()
    show({ tone: 'success', title: enabled ? 'Rule enabled' : 'Rule disabled' })
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-6">
      <PageHeader title="Pronunciation" description="Custom pronunciations and text normalization rules used across every Jaan agent." />

      <Card>
        <CardHeader title="Pronunciation Dictionary" description="Words Jaan should say a specific way — brand names, customer names, industry terms." actions={<Button size="sm" icon={<Plus className="size-3.5" />} onClick={() => setModalOpen(true)}>Add Entry</Button>} />
        {entries.data && entries.data.length === 0 ? (
          <CardBody>
            <EmptyState compact icon={<BookMarked className="size-6" />} title="No custom pronunciations yet" description="Add a word and how Jaan should say it." action={<Button size="sm" icon={<Plus className="size-4" />} onClick={() => setModalOpen(true)}>Add Entry</Button>} />
          </CardBody>
        ) : (
          <div className="divide-y divide-ink-100">
            {(entries.data ?? []).map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <p className="text-[13.5px] font-medium text-ink-800">{e.word} <span className="font-normal text-ink-400">→</span> {e.pronunciation}</p>
                  {e.notes && <p className="text-xs text-ink-500">{e.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-400">{SUPPORTED_LANGUAGES.find((l) => l.code === e.language)?.label ?? e.language}</span>
                  <button onClick={() => remove(e.id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-danger-50 hover:text-danger-600" aria-label={`Remove ${e.word}`}>
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Text Normalization" description="How numbers, dates and other text are converted to natural speech." />
        <div className="divide-y divide-ink-100">
          {(rules.data ?? []).map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div>
                <p className="text-[13px] font-medium text-ink-800">{r.label} <span className="ml-1 rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">{TEXT_NORMALIZATION_CATEGORY_LABEL[r.category]}</span></p>
                <p className="mt-0.5 text-xs text-ink-500">{r.example}</p>
              </div>
              <Switch checked={r.enabled} onChange={(v) => toggleRule(r.id, v)} />
            </div>
          ))}
        </div>
      </Card>

      <AddEntryModal open={modalOpen} onClose={() => setModalOpen(false)} onAdded={entries.refetch} />
    </div>
  )
}
