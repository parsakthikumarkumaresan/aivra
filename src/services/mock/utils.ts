// Simulated network latency so loading/skeleton states are real during development.
// Swapping services/mock/* for services/api/* (real FastAPI calls) removes this —
// nothing in hooks/components needs to change since they only depend on the
// service function signatures (Promise<T>).
export function delay<T>(value: T, ms = 450): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export function maybeFail(failRate = 0): boolean {
  return Math.random() < failRate
}

let counter = 0
export function nextId(prefix: string): string {
  counter += 1
  return `${prefix}_${counter.toString(36)}`
}
