import { motion } from 'framer-motion'
import { ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { MEMORIES } from '../config'

/**
 * Her photos, on the page itself.
 *
 * Everything warm used to live behind a card she had to tap, which left the
 * scroll looking empty. This puts the actual pictures in the flow — a
 * swipeable strip that reads as a roll of film.
 */
export function PhotoStrip() {
  const [broken, setBroken] = useState<Record<number, boolean>>({})

  return (
    <section className="relative w-full py-12">
      <div className="mx-auto mb-5 w-full max-w-lg px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="hud-label mb-2 text-rose/70"
        >
          receipts
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="font-display text-2xl leading-tight font-light text-balance text-white/90 sm:text-3xl"
        >
          Some of my favourite
          <br />
          <span className="warm-text">evidence.</span>
        </motion.h2>
      </div>

      {/* full-bleed so it runs off the edge of the phone — invites the swipe */}
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2">
        {MEMORIES.map((m, i) => (
          <motion.figure
            key={m.src}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: Math.min(i * 0.08, 0.32) }}
            className="relative w-[70vw] max-w-[260px] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10"
          >
            <div className="relative aspect-[4/5] w-full bg-charcoal">
              {broken[i] ? (
                <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-rose/20 via-obsidian to-blood/15">
                  <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <ImageIcon size={22} className="text-rose/70" />
                    <p className="mono-label">
                      {String(i + 1).padStart(2, '0')}.jpg
                    </p>
                  </div>
                </div>
              ) : (
                <img
                  src={m.src}
                  alt={m.caption}
                  loading="lazy"
                  draggable={false}
                  onError={() => setBroken((b) => ({ ...b, [i]: true }))}
                  className="h-full w-full object-cover select-none"
                />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 to-transparent" />
            </div>

            <figcaption className="absolute inset-x-0 bottom-0 p-3.5">
              {m.date && <p className="mono-label mb-1 text-rose/70">{m.date}</p>}
              <p className="text-[12.5px] leading-snug text-white/85">{m.caption}</p>
            </figcaption>
          </motion.figure>
        ))}
      </div>

      <p className="mx-auto mt-4 w-full max-w-lg px-6 text-[12px] text-white/30">
        swipe →
      </p>
    </section>
  )
}
