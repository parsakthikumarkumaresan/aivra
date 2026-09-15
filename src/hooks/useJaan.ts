import {
  jaanCampaignsService,
  jaanWorkflowsService,
  jaanTablesService,
  jaanMonitorService,
  jaanSimulationsService,
  jaanPronunciationService,
  jaanBalanceService,
  jaanLogsService,
} from '@/services/api'
import { useAsync } from './useAsync'

// -- Campaigns ---------------------------------------------------------------
export function useCampaigns() {
  return useAsync(() => jaanCampaignsService.listCampaigns(), [])
}
export function useCampaign(id: string) {
  return useAsync(() => jaanCampaignsService.getCampaign(id), [id])
}
export function useCampaignSummary(id: string) {
  return useAsync(() => jaanCampaignsService.getCampaignSummary(id), [id])
}
export function useCampaignTasks(id: string) {
  return useAsync(() => jaanCampaignsService.listCampaignTasks(id), [id])
}

// -- Workflows -----------------------------------------------------------------
export function useWorkflows() {
  return useAsync(() => jaanWorkflowsService.listWorkflows(), [])
}

// -- Tables ----------------------------------------------------------------------
export function useAgentTables() {
  return useAsync(() => jaanTablesService.listTables(), [])
}
export function useAgentTable(id: string) {
  return useAsync(() => jaanTablesService.getTable(id), [id])
}

// -- Monitor & QA ------------------------------------------------------------
export function useQaMetrics() {
  return useAsync(() => jaanMonitorService.listMetrics(), [])
}
export function useEvaluationRuns() {
  return useAsync(() => jaanMonitorService.listRuns(), [])
}
export function useReviews() {
  return useAsync(() => jaanMonitorService.listReviews(), [])
}
export function useAlertRules() {
  return useAsync(() => jaanMonitorService.listAlertRules(), [])
}
export function useReports() {
  return useAsync(() => jaanMonitorService.listReports(), [])
}

// -- Simulations ---------------------------------------------------------------
export function useSimulations() {
  return useAsync(() => jaanSimulationsService.listSimulations(), [])
}

// -- Pronunciation & text normalization ---------------------------------------
export function usePronunciationEntries() {
  return useAsync(() => jaanPronunciationService.listEntries(), [])
}
export function useTextNormalizationRules() {
  return useAsync(() => jaanPronunciationService.listNormalizationRules(), [])
}

// -- Balance ---------------------------------------------------------------------
export function useBalance() {
  return useAsync(() => jaanBalanceService.getBalance(), [])
}
export function useCreditTransactions() {
  return useAsync(() => jaanBalanceService.listTransactions(), [])
}

// -- Logs --------------------------------------------------------------------------
export function useToolLogs() {
  return useAsync(() => jaanLogsService.listToolLogs(), [])
}
export function useApiWebhookLogs() {
  return useAsync(() => jaanLogsService.listApiWebhookLogs(), [])
}
export function useLibraryLogs() {
  return useAsync(() => jaanLogsService.listLibraryLogs(), [])
}
export function useAudioIngestionLogs() {
  return useAsync(() => jaanLogsService.listAudioIngestionLogs(), [])
}
