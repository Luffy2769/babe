import { AnimatePresence, motion } from 'framer-motion'
import { Radio } from 'lucide-react'
import { useState } from 'react'
import { COPY } from '../config'
import { useAudio } from '../hooks/audioContext'

/**
 * The autoplay-policy solution.
 *
 * No browser will start audio without a genuine user gesture, so instead of
 * fighting it we make the gesture part of the story: one glowing button that
 * boots the AudioContext, starts the track, and dissolves.
 */
export function BootGate({ onDone }: { onDone: () => void }) {
  const { start } = useAudio()
  const [leaving, setLeaving] = useState(false)
  const [busy, setBusy] = useState(false)

  const handle = async () => {
    if (busy) return
    setBusy(true)
    // Must be awaited inside the click handler's task for iOS to count it.
    await start()
    setLeaving(true)
    // Let the fade play out before unmounting the overlay.
    window.setTimeout(onDone, 900)
  }

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-obsidian px-6"
          exit={{ opacity: 0, filter: 'blur(12px)', scale: 1.04 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* breathing crimson core behind everything */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-crimson/20 blur-[110px]"
            animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* a single scanline crawling down the plate */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 h-24 animate-scan bg-gradient-to-b from-transparent via-crimson/10 to-transparent"
          />

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <p className="hud-label mb-5 text-crimson/80">{COPY.bootEyebrow}</p>

            <h1 className="font-display text-4xl leading-none font-bold tracking-tight sm:text-6xl">
              <span className="neon-text">{COPY.bootTitle}</span>
            </h1>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-balance text-white/45">
              {COPY.bootSub}
            </p>

            <motion.button
              onClick={handle}
              disabled={busy}
              whileTap={{ scale: 0.95 }}
              className="group relative mt-10 inline-flex min-h-[56px] items-center gap-3 rounded-full border border-crimson/60 bg-crimson/10 px-9 py-4 font-mono text-[12px] font-bold tracking-[0.25em] text-white uppercase backdrop-blur-md"
              style={{ boxShadow: '0 0 40px -8px rgba(255,26,26,0.75)' }}
            >
              {/* ring pulse radiating out of the button */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full border border-crimson/50"
                animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
              />
              <Radio size={16} className="text-crimson" />
              {busy ? 'connecting…' : COPY.bootCta}
            </motion.button>

            <p className="mt-6 font-mono text-[10px] tracking-[0.2em] text-white/25 uppercase">
              headphones recommended
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
