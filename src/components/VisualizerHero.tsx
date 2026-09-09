import { AnimatePresence, motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { LYRICS, PEOPLE } from '../config'
import { usePrefersReducedMotion } from '../hooks/useReducedMotion'
import * as engine from '../lib/audio'

/**
 * Circular spectrum ring + mirrored bars, drawn from the shared AnalyserNode.
 * Falls back to a slow synthetic wave when there is no analyser (blocked
 * AudioContext, missing track) so the hero never looks broken.
 */
function SpectrumRing() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let size = 0
    let data: Uint8Array<ArrayBuffer> | null = null
    const BARS = 72
    // Smoothed per-bar values so the ring eases instead of strobing.
    const smooth = new Float32Array(BARS)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      size = Math.min(canvas.clientWidth, canvas.clientHeight)
      canvas.width = Math.round(size * dpr)
      canvas.height = Math.round(size * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (ts: number) => {
      const n = engine.binCount()
      if (n && (!data || data.length !== n)) data = new Uint8Array(n)
      // A silent analyser returns all zeros, which would flatline the ring —
      // so treat "not playing" the same as "no analyser at all".
      const spectrum = data && engine.isPlaying() ? engine.readSpectrum(data) : null

      const cx = size / 2
      const cy = size / 2
      const radius = size * 0.27
      ctx.clearRect(0, 0, size, size)

      let energy = 0
      for (let i = 0; i < BARS; i++) {
        // Log-ish mapping: the bottom third of the spectrum holds the music.
        const idx = spectrum
          ? Math.floor(Math.pow(i / BARS, 1.6) * spectrum.length * 0.7)
          : 0
        const raw = spectrum
          ? spectrum[idx] / 255
          : 0.28 + Math.abs(Math.sin(ts / 900 + i * 0.24)) * 0.3

        smooth[i] += (raw - smooth[i]) * (reduced ? 1 : 0.24)
        const v = smooth[i]
        energy += v

        const angle = (i / BARS) * Math.PI * 2 - Math.PI / 2
        const len = 8 + v * size * 0.17
        const x1 = cx + Math.cos(angle) * radius
        const y1 = cy + Math.sin(angle) * radius
        const x2 = cx + Math.cos(angle) * (radius + len)
        const y2 = cy + Math.sin(angle) * (radius + len)

        const g = ctx.createLinearGradient(x1, y1, x2, y2)
        g.addColorStop(0, `rgba(255, 26, 26, ${0.35 + v * 0.65})`)
        g.addColorStop(1, `rgba(255, 200, 90, ${v * 0.9})`)

        ctx.beginPath()
        ctx.strokeStyle = g
        ctx.lineWidth = Math.max(1.6, size * 0.007)
        ctx.lineCap = 'round'
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      // Core ring — brightness rides the overall energy of the track.
      const avg = energy / BARS
      ctx.beginPath()
      ctx.arc(cx, cy, radius - 6, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255, 45, 85, ${0.25 + avg * 0.55})`
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx, cy, radius * (0.62 + avg * 0.22), 0, Math.PI * 2)
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      core.addColorStop(0, `rgba(255, 26, 26, ${0.16 + avg * 0.3})`)
      core.addColorStop(1, 'rgba(255, 26, 26, 0)')
      ctx.fillStyle = core
      ctx.fill()

      raf = requestAnimationFrame(draw)
    }

    resize()
    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [reduced])

  return <canvas ref={ref} aria-hidden className="h-full w-full" />
}

/**
 * Floating kinetic lyric card. Picks the latest line whose timestamp has
 * passed, polling the element's currentTime — retime the lines in config.ts.
 */
function KineticLyrics() {
  const [line, setLine] = useState<(typeof LYRICS)[number] | null>(null)

  useEffect(() => {
    const pick = () => {
      const t = engine.currentTime()
      // The track loops, so wrap the lookup past the last cue.
      let current: (typeof LYRICS)[number] | null = null
      for (const l of LYRICS) if (t >= l.t) current = l
      setLine(current ?? LYRICS[0] ?? null)
    }
    pick()
    const id = window.setInterval(pick, 400)
    return () => window.clearInterval(id)
  }, [])

  if (!line) return null

  return (
    <div className="pointer-events-none flex min-h-[92px] w-full items-center justify-center px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={line.text}
          initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="glass max-w-sm rounded-2xl px-5 py-3.5"
        >
          <p
            className={`text-center text-[15px] leading-snug text-balance sm:text-base ${
              line.accent ? 'neon-text font-medium' : 'text-white/70'
            }`}
          >
            {line.text}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function VisualizerHero() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-16">
      {/* the ring, with the date sitting in its centre */}
      <div className="relative aspect-square w-full max-w-[440px]">
        <SpectrumRing />

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="hud-label mb-2 text-crimson/80"
          >
            signal unlocked
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2rem,11vw,3.6rem)] leading-[0.95] font-bold tracking-tight"
          >
            <span className="neon-text">HAPPY</span>
            <br />
            <span className="text-white/90">BIRTHDAY</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.9 }}
            className="mt-3 flex items-center gap-2 font-mono text-[11px] tracking-[0.28em] text-white/45 uppercase"
          >
            <Heart size={11} className="text-crimson" fill="currentColor" />
            {PEOPLE.recipient.name}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.9 }}
            className="mt-1 font-mono text-[10px] tracking-[0.3em] text-white/25"
          >
            16 . 09 . 2026 — 00:00 WIB
          </motion.p>
        </div>
      </div>

      <KineticLyrics />

      {/* scroll affordance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-mono text-[9px] tracking-[0.3em] text-white/25 uppercase">
          scroll
        </span>
        <motion.span
          className="h-8 w-px bg-gradient-to-b from-crimson to-transparent"
          animate={{ opacity: [0.3, 1, 0.3], scaleY: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originY: 0 }}
        />
      </motion.div>
    </section>
  )
}
