import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { MEMORIES } from '../config'

/** Neon placeholder shown until a real photo is dropped in — or if one 404s. */
function Placeholder({ index }: { index: number }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-crimson/20 via-obsidian to-blood/15">
      <div className="flex flex-col items-center gap-2 px-6 text-center">
        <ImageIcon size={26} className="text-crimson/60" />
        <p className="font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase">
          /images/memories/{String(index + 1).padStart(2, '0')}.jpg
        </p>
      </div>
    </div>
  )
}

export function MemoryCarousel() {
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const [broken, setBroken] = useState<Record<number, boolean>>({})

  const go = (delta: number) => {
    setDir(delta)
    setI((prev) => (prev + delta + MEMORIES.length) % MEMORIES.length)
  }

  const memory = MEMORIES[i]

  return (
    <div>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/10 bg-charcoal">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={i}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60, scale: 1.04 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: dir * -60, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            onDragEnd={(_, info) => {
              // Swipe on touch; a short flick counts via velocity.
              if (info.offset.x < -60 || info.velocity.x < -450) go(1)
              else if (info.offset.x > 60 || info.velocity.x > 450) go(-1)
            }}
            className="absolute inset-0"
          >
            {broken[i] ? (
              <Placeholder index={i} />
            ) : (
              <img
                src={memory.src}
                alt={memory.caption}
                draggable={false}
                onError={() => setBroken((b) => ({ ...b, [i]: true }))}
                className="h-full w-full object-cover select-none"
              />
            )}

            {/* legibility scrim under the caption */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-4">
              {memory.date && (
                <p className="hud-label mb-1 text-crimson/70">{memory.date}</p>
              )}
              <p className="text-[13px] leading-snug text-balance text-white/85">
                {memory.caption}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* arrows — visible on desktop, swipe covers mobile */}
        <button
          onClick={() => go(-1)}
          aria-label="Previous memory"
          className="absolute top-1/2 left-2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 text-white/70 backdrop-blur-md transition-colors hover:text-white"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Next memory"
          className="absolute top-1/2 right-2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/40 text-white/70 backdrop-blur-md transition-colors hover:text-white"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {MEMORIES.map((_, n) => (
          <button
            key={n}
            onClick={() => {
              setDir(n > i ? 1 : -1)
              setI(n)
            }}
            aria-label={`Memory ${n + 1}`}
            className="p-2"
          >
            <span
              className={`block h-1.5 rounded-full transition-all ${
                n === i ? 'w-6 bg-crimson' : 'w-1.5 bg-white/25'
              }`}
              style={n === i ? { boxShadow: '0 0 8px rgba(255,26,26,0.9)' } : undefined}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
