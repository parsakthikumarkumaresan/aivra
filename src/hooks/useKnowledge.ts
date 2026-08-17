import { knowledgeService } from '@/services/api'
import { useAsync } from './useAsync'

export function useKnowledgeSources() {
  return useAsync(() => knowledgeService.listSources(), [])
}

export function useKnowledgeSource(id: string) {
  return useAsync(() => knowledgeService.getSource(id), [id])
}
