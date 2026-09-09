import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { COPY, DISTANCE_KM, PEOPLE } from '../config'
import { useCountdown } from '../hooks/useCountdown'
import { buzz, midnightBurst } from '../lib/celebrate'
import { now, pad, zonedClock, zonedDate } from '../lib/time'
import { RedWaveCanvas } from './RedWaveCanvas'
import { SecretAccess } from './SecretAccess'

const SCRAMBLE_MS = 2200
const GLYPHS = '0123456789ABCDEF#%&*'

type Person = (typeof PEOPLE)['sender'] | (typeof PEOPLE)['recipient']

/** One HUD card with a live, timezone-correct wall clock. */
function ClockCard({
  person,
  accent,
  delay,
}: {
  person: Person
  accent: boolean
  delay: number
}) {
  const [ts, setTs] = useState(() => now())

  useEffect(() => {
    // 250ms so the seconds digit never appears to skip.
    const id = window.setInterval(() => setTs(now()), 250)
    return () => window.clearInterval(id)
  }, [])

  const [hh, mm, ss] = zonedClock(ts, person.timeZone).split(':')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass relative flex-1 overflow-hidden rounded-2xl px-4 py-4 sm:px-5 sm:py-5"
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent ${
          accent ? 'via-crimson/70' : 'via-white/25'
        }`}
      />
      <div className="absolute top-2.5 right-3">
        <span
          className={`block h-1.5 w-1.5 rounded-full ${accent ? 'bg-crimson' : 'bg-white/40'}`}
          style={accent ? { boxShadow: '0 0 8px #ff1a1a' } : undefined}
        />
      </div>

      <p className="hud-label mb-0.5">{person.label}</p>
      <p className="mb-3 font-mono text-[9px] tracking-[0.18em] text-white/25 uppercase">
        {person.zoneLabel}
      </p>

      <p
        className={`font-mono text-[26px] leading-none font-bold tabular-nums sm:text-[32px] ${
          accent ? 'neon-text' : 'text-white'
        }`}
      >
        {hh}
        <span className="mx-px animate-pulse text-white/30">:</span>
        {mm}
        <span className="text-[0.55em] text-white/25">:</span>
        <span className="text-[0.55em] text-white/40">{ss}</span>
      </p>

      <p className="mt-2 font-mono text-[9px] tracking-normal text-white/30">
        {zonedDate(ts, person.timeZone)} · {person.city}
      </p>
    </motion.div>
  )
}

/** A single countdown cell. Scrambles through glyphs during the transition. */
function Unit({
  value,
  label,
  scrambling,
  width = 2,
}: {
  value: number
  label: string
  scrambling: boolean
  width?: number
}) {
  const [noise, setNoise] = useState('')

  // Only the glitch text is state; the real value stays derived, so a normal
  // tick never round-trips through an effect.
  useEffect(() => {
    if (!scrambling) return
    const id = window.setInterval(() => {
      let out = ''
      for (let i = 0; i < width; i++) {
        out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }
      setNoise(out)
    }, 45)
    return () => window.clearInterval(id)
  }, [width, scrambling])

  const display = scrambling && noise ? noise : pad(value, width)

  return (
    <div className="flex flex-col items-center">
      <span
        className={`font-mono text-[clamp(2.3rem,14vw,4.4rem)] leading-none font-extrabold tabular-nums ${
          scrambling ? 'text-crimson' : 'neon-text'
        }`}
        style={
          scrambling
            ? { textShadow: '2px 0 #ff2d55, -2px 0 #00e5ff, 0 0 18px #ff1a1a' }
            : undefined
        }
      >
        {display}
      </span>
      <span className="mt-2 font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase sm:text-[10px]">
        {label}
      </span>
    </div>
  )
}

const Colon = ({ dim }: { dim: boolean }) => (
  <span
    className={`-mt-1 font-mono text-[clamp(1.6rem,9vw,3rem)] leading-none font-bold ${
      dim ? 'text-crimson/60' : 'text-white/20'
    }`}
  >
    :
  </span>
)

export function TimeLockGate({
  targetTs,
  onUnlock,
  onPreview,
}: {
  targetTs: number
  /** the real midnight rollover — plays the full glitch + confetti */
  onUnlock: () => void
  /** the secret key panel — skips straight in, no fanfare */
  onPreview: () => void
}) {
  const { remaining, verified, justHitZero } = useCountdown(targetTs)
  const [scrambling, setScrambling] = useState(false)
  const firedRef = useRef(false)

  // The midnight transition: scramble → burst → hand over to the unlocked view.
  useEffect(() => {
    if (!justHitZero || firedRef.current) return
    firedRef.current = true
    setScrambling(true)
    buzz([60, 40, 60, 40, 180])

    const burstAt = window.setTimeout(midnightBurst, SCRAMBLE_MS - 350)
    const handOff = window.setTimeout(() => {
      setScrambling(false)
      onUnlock()
    }, SCRAMBLE_MS)

    return () => {
      window.clearTimeout(burstAt)
      window.clearTimeout(handOff)
    }
  }, [justHitZero, onUnlock])

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-14">
      <RedWaveCanvas heightRatio={0.45} />

      {/* white flash at the moment of unlock */}
      <AnimatePresence>
        {scrambling && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-30 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.08, 0, 0.55] }}
            exit={{ opacity: 0 }}
            transition={{ duration: SCRAMBLE_MS / 1000, times: [0, 0.5, 0.62, 0.75, 1] }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        {/* status strip — also hides the long-press key panel */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SecretAccess verified={verified} onGranted={onPreview} />
        </motion.div>

        {/* the countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full items-center justify-center gap-1.5 sm:gap-3"
        >
          <Unit value={remaining.days} label="days" scrambling={scrambling} />
          <Colon dim={scrambling} />
          <Unit value={remaining.hours} label="hrs" scrambling={scrambling} />
          <Colon dim={scrambling} />
          <Unit value={remaining.minutes} label="min" scrambling={scrambling} />
          <Colon dim={scrambling} />
          <Unit value={remaining.seconds} label="sec" scrambling={scrambling} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-7 mb-9 max-w-sm text-center text-[13px] leading-relaxed text-balance text-white/45 sm:text-sm"
        >
          {COPY.teaser}
        </motion.p>

        {/* dual clocks */}
        <div className="flex w-full gap-3">
          <ClockCard person={PEOPLE.sender} accent={false} delay={0.25} />
          <ClockCard person={PEOPLE.recipient} accent delay={0.38} />
        </div>

        {/* distance readout with a packet crawling along the line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.9 }}
          className="mt-6 flex w-full items-center gap-3 px-1"
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />
          <span className="relative h-px flex-1 bg-gradient-to-r from-white/20 via-crimson/40 to-crimson/60">
            <motion.span
              aria-hidden
              className="absolute -top-[3px] h-[7px] w-[7px] rounded-full bg-crimson"
              style={{ boxShadow: '0 0 10px 2px rgba(255,26,26,0.9)' }}
              animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-crimson"
            style={{ boxShadow: '0 0 8px #ff1a1a' }}
          />
          <span className="font-mono text-[10px] tracking-[0.2em] text-white/30">
            {DISTANCE_KM.toLocaleString()} KM
          </span>
        </motion.div>
      </div>
    </div>
  )
}
