// Mirrors the backend's stable error envelope:
//   { "error": { "code": "...", "message": "...", "details": {}, "request_id": "..." } }
// UI code should branch on `.code` (stable, machine-readable) — never on
// `.message` (human copy, not a contract).
export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly details: Record<string, unknown>
  readonly requestId?: string

  constructor(
    message: string,
    opts: { code: string; status: number; details?: Record<string, unknown>; requestId?: string },
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = opts.code
    this.status = opts.status
    this.details = opts.details ?? {}
    this.requestId = opts.requestId
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}
