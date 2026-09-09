import { useCallback, useEffect, useState } from 'react'

/**
 * localStorage-backed state. Wrapped in try/catch throughout because Safari
 * private mode throws on write, and some in-app browsers block it outright —
 * in that case the app simply forgets between visits instead of crashing.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage unavailable — keep going in memory */
    }
  }, [key, value])

  const reset = useCallback(() => {
    setValue(initial)
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* no-op */
    }
    // `initial` is intentionally not a dep: resetting to the first-render
    // default is the whole point, and object literals would re-create it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return [value, setValue, reset] as const
}
