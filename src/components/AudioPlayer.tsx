import { motion } from 'framer-motion'
import { Disc3, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AUDIO } from '../config'
import { useAudio } from '../hooks/audioContext'
import * as engine from '../lib/audio'

/** Eight live equaliser bars driven by the analyser (or a fake idle wobble). */
function Equalizer({ active }: { active: boolean }) {
  const bars = useRef<(HTMLSpanElement | null)[]>([])
  const data = useRef<Uint8Array<ArrayBuffer> | null>(null)

  useEffect(() => {
    let raf = 0
    const count = bars.current.length

    const tick = (ts: number) => {
      const n = engine.binCount()
      if (n && (!data.current || data.current.length !== n)) {
        data.current = new Uint8Array(n)
      }
      const spectrum = data.current ? engine.readSpectrum(data.current) : null

      for (let i = 0; i < count; i++) {
        const el = bars.current[i]
        if (!el) continue
        let v: number
        if (!active) {
          v = 0.12
        } else if (spectrum) {
          // Low bins carry the kick; spread the 8 bars across the useful range.
          const idx = Math.floor(((i + 1) / (count + 1)) * spectrum.length * 0.55)
          v = 0.15 + (spectrum[idx] / 255) * 0.85
        } else {
          // No analyser (older Safari / blocked context): a plausible wobble.
          v = 0.3 + Math.abs(Math.sin(ts / 320 + i * 0.7)) * 0.55
        }
        el.style.transform = `scaleY(${Math.max(0.1, Math.min(1, v))})`
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return (
    <div className="flex h-4 items-end gap-[2px]" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            bars.current[i] = el
          }}
          className="h-4 w-[2px] origin-bottom rounded-full bg-crimson transition-none"
          style={{ transform: 'scaleY(0.12)' }}
        />
      ))}
    </div>
  )
}

/**
 * Pinned top-right transport: spinning vinyl, live equaliser, play/pause and
 * mute. Expands on tap to show the track title without stealing the corner.
 */
export function AudioPlayer() {
  const { started, playing, muted, failed, toggle, toggleMute } = useAudio()
  const [expanded, setExpanded] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!expanded) return
    const id = window.setTimeout(() => setExpanded(false), 4000)
    return () => window.clearTimeout(id)
  }, [expanded])

  // The pill is fixed, so on a narrow screen it sits on top of whatever
  // heading happens to be at the top of the viewport. Tuck it away while
  // she is reading downward and bring it back the moment she scrolls up.
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (Math.abs(y - last) > 6) {
        setHidden(y > 120 && y > last)
        last = y
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!started) return null

  const live = playing && !muted && !failed

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? -28 : 0 }}
      transition={{ delay: hidden ? 0 : 0.5, duration: hidden ? 0.28 : 0.6 }}
      className={`fixed top-0 right-0 z-40 p-3 sm:p-4 ${hidden ? 'pointer-events-none' : ''}`}
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <div className="glass flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-2 shadow-[0_0_30px_-12px_rgba(255,26,26,0.9)]">
        <button
          onClick={() => setExpanded((e) => !e)}
          aria-label="Track info"
          className="relative grid h-9 w-9 shrink-0 place-items-center"
        >
          <Disc3
            size={22}
            className={`text-crimson ${live ? 'animate-spin-slow' : 'opacity-50'}`}
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,26,26,0.8))' }}
          />
        </button>

        <motion.div
          animate={{
            width: expanded ? 'auto' : 0,
            opacity: expanded ? 1 : 0,
            marginRight: expanded ? 4 : 0,
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden whitespace-nowrap"
        >
          <p className="font-mono text-[10px] leading-tight tracking-widest text-white uppercase">
            {AUDIO.title}
          </p>
          <p className="font-mono text-[9px] leading-tight text-white/40">
            {failed ? 'track not found' : AUDIO.artist}
          </p>
        </motion.div>

        <div className="hidden px-1 sm:block">
          <Equalizer active={live} />
        </div>

        <button
          onClick={toggle}
          disabled={failed}
          aria-label={playing ? 'Pause music' : 'Play music'}
          className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
        </button>

        <button
          onClick={toggleMute}
          disabled={failed}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>
    </motion.div>
  )
}
