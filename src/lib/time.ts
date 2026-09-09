import { UNLOCK_TS } from '../config'

export type Remaining = {
  total: number
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

export function splitRemaining(ms: number): Remaining {
  const total = Math.max(0, ms)
  const s = Math.floor(total / 1000)
  return {
    total,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: total <= 0,
  }
}

export const pad = (n: number, len = 2) => String(Math.max(0, n)).padStart(len, '0')

/* ────────────────────────────────────────────────────────────────────────────
   Clock skew correction.

   The lock is only as trustworthy as the device clock, and phone clocks drift
   (or get nudged forward by someone impatient). Before trusting `Date.now()`
   we do a HEAD request against our own origin and read the `Date` response
   header — every HTTP server sends one, so this needs no third-party API and
   works on any static host. If the request fails we silently fall back to
   system time; the countdown still runs, just unverified.
   ──────────────────────────────────────────────────────────────────────────── */

let skewMs = 0
let verified = false
let inFlight: Promise<{ verified: boolean; skewMs: number }> | null = null

export function now(): number {
  return Date.now() + skewMs
}

export function isVerified(): boolean {
  return verified
}

export function syncClock(): Promise<{ verified: boolean; skewMs: number }> {
  // Several components ask on mount; they all share one request. Chrome aborts
  // identical concurrent HEADs to the same URL, so this is correctness, not
  // just politeness.
  inFlight ??= probe()
  return inFlight
}

async function probe(): Promise<{ verified: boolean; skewMs: number }> {
  try {
    const t0 = Date.now()
    const res = await fetch(window.location.href, {
      method: 'HEAD',
      cache: 'no-store',
    })
    const t1 = Date.now()
    const header = res.headers.get('date')
    if (!header) return { verified: false, skewMs: 0 }
    const server = Date.parse(header)
    if (Number.isNaN(server)) return { verified: false, skewMs: 0 }

    // Compensate for round-trip latency, then ignore sub-2s noise: the Date
    // header only has second resolution, so small deltas are meaningless.
    const latency = (t1 - t0) / 2
    const delta = server + latency - t1
    skewMs = Math.abs(delta) > 2000 ? delta : 0
    verified = true
  } catch {
    skewMs = 0
    verified = false
  }
  return { verified, skewMs }
}

/* ────────────────────────────────────────────────────────────────────────────
   Timezone-correct wall clocks.

   Built on Intl rather than manual +5:30/+7:00 arithmetic so the clocks stay
   right regardless of the viewer's own device timezone.
   ──────────────────────────────────────────────────────────────────────────── */

const clockFormatters = new Map<string, Intl.DateTimeFormat>()
const dateFormatters = new Map<string, Intl.DateTimeFormat>()

function clockFormatter(timeZone: string) {
  let f = clockFormatters.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    clockFormatters.set(timeZone, f)
  }
  return f
}

function dateFormatter(timeZone: string) {
  let f = dateFormatters.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
    dateFormatters.set(timeZone, f)
  }
  return f
}

/** "23:41:07" in the given zone. */
export function zonedClock(ts: number, timeZone: string): string {
  return clockFormatter(timeZone).format(new Date(ts)).replace(/ /g, ' ')
}

/** "Tue, 15 Sep" in the given zone. */
export function zonedDate(ts: number, timeZone: string): string {
  return dateFormatter(timeZone).format(new Date(ts))
}

/* ────────────────────────────────────────────────────────────────────────────
   Preview overrides (development / rehearsal only).

     ?unlock          → skip the gate, jump straight to the unlocked view
     ?locked          → force the gate even after the real unlock moment
     ?soon=12         → pretend the unlock is 12 seconds away (rehearse the
                        midnight glitch + confetti transition end to end)

   Remove nothing before you send the link — none of these fire on their own.
   ──────────────────────────────────────────────────────────────────────────── */

export type Preview = { force: 'unlocked' | 'locked' | null; targetTs: number }

export function readPreview(): Preview {
  if (typeof window === 'undefined') return { force: null, targetTs: UNLOCK_TS }
  const q = new URLSearchParams(window.location.search)
  const soon = q.get('soon')
  const seconds = soon === null ? NaN : Number(soon)
  return {
    force: q.has('unlock') ? 'unlocked' : q.has('locked') ? 'locked' : null,
    targetTs: Number.isFinite(seconds) ? Date.now() + seconds * 1000 : UNLOCK_TS,
  }
}
