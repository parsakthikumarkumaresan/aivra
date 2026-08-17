import { useCallback, useEffect, useRef, useState } from 'react'

interface UseAsyncState<T> {
  data: T | undefined
  loading: boolean
  error: Error | null
}

export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<UseAsyncState<T>>({ data: undefined, loading: true, error: null })
  const requestId = useRef(0)

  const run = useCallback(() => {
    const id = ++requestId.current
    setState((prev) => ({ ...prev, loading: true, error: null }))
    fetcher()
      .then((data) => {
        if (requestId.current === id) setState({ data, loading: false, error: null })
      })
      .catch((error: Error) => {
        if (requestId.current === id) setState({ data: undefined, loading: false, error })
      })
  }, deps)

  useEffect(() => {
    run()
  }, deps)

  return { ...state, refetch: run }
}
