import { useEffect, useRef, useState } from 'react'
import { now, splitRemaining, syncClock, type Remaining } from '../lib/time'

/**
 * Ticks toward `targetTs`, recomputing from the (skew-corrected) wall clock on
 * every tick rather than decrementing a counter — so it stays exact even after
 * the phone sleeps, the tab is backgrounded, or a tick is dropped.
 */
export function useCountdown(targetTs: number, enabled = true) {
  const [remaining, setRemaining] = useState<Remaining>(() =>
    splitRemaining(targetTs - now()),
  )
  const [verified, setVerified] = useState(false)
  const firedRef = useRef(false)
  const [justHitZero, setJustHitZero] = useState(false)

  useEffect(() => {
    let cancelled = false
    void syncClock().then((r) => {
      if (!cancelled) {
        setVerified(r.verified)
        setRemaining(splitRemaining(targetTs - now()))
      }
    })
    return () => {
      cancelled = true
    }
  }, [targetTs])

  useEffect(() => {
    if (!enabled) return

    const tick = () => {
      const next = splitRemaining(targetTs - now())
      setRemaining(next)
      if (next.done && !firedRef.current) {
        firedRef.current = true
        setJustHitZero(true)
      }
    }

    tick()
    // 200ms keeps the seconds digit from visibly lagging its true rollover.
    const id = window.setInterval(tick, 200)
    // Backgrounded tabs throttle timers hard; resync the instant we return.
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [targetTs, enabled])

  return { remaining, verified, justHitZero }
}
