import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { errorMessage } from '../api/client'

interface AsyncState<T> {
  data: T | undefined
  error: string | null
  loading: boolean
  reload: () => void
  setData: (data: T) => void
}

interface Settled<T> {
  requestKey: string
  data: T | undefined
  error: string | null
}

/**
 * Runs `loader` whenever `key` changes (or `reload` is called) and tracks loading/error state.
 * The previous data stays visible while a new request is in flight, and responses from stale
 * requests are ignored so fast filter changes never show outdated results.
 */
export function useAsync<T>(loader: () => Promise<T>, key: string): AsyncState<T> {
  const [reloadCount, setReloadCount] = useState(0)
  const [settled, setSettled] = useState<Settled<T>>()
  const requestKey = `${key}#${reloadCount}`

  // Always call the latest loader without re-running the effect when its identity changes.
  const loaderRef = useRef(loader)
  useLayoutEffect(() => {
    loaderRef.current = loader
  })

  useEffect(() => {
    let cancelled = false
    loaderRef.current().then(
      (data) => {
        if (!cancelled) setSettled({ requestKey, data, error: null })
      },
      (err: unknown) => {
        if (!cancelled) setSettled({ requestKey, data: undefined, error: errorMessage(err) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [requestKey])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])
  const setData = useCallback(
    (data: T) => setSettled((prev) => ({ requestKey: prev?.requestKey ?? '', data, error: null })),
    [],
  )

  return {
    data: settled?.data,
    error: settled?.requestKey === requestKey ? settled.error : null,
    loading: settled?.requestKey !== requestKey,
    reload,
    setData,
  }
}
