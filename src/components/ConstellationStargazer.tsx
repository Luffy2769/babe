import { AnimatePresence, motion } from 'framer-motion'
import { Send, Sparkles, Star } from 'lucide-react'
import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { buzz, wishBurst } from '../lib/celebrate'
import { playClick, playHarpChord, playSparkle } from '../lib/sfx'
import { SectionHeading } from './ui/SectionHeading'

interface StarNode {
  id: number
  name: string
  x: number // percentage
  y: number // percentage
  lore: string
}

const STAR_NODES: StarNode[] = [
  { id: 1, name: 'Mumbai Sky', x: 20, y: 35, lore: 'Where I look up at night thinking about you.' },
  { id: 2, name: 'First Dawn', x: 40, y: 18, lore: 'The sunrise we shared on call across timezones.' },
  { id: 3, name: 'Equator Beam', x: 60, y: 40, lore: 'Where our signals cross the tropical ocean.' },
  { id: 4, name: 'Sampit Sky', x: 80, y: 25, lore: 'Where the love of my life is sleeping tonight.' },
  { id: 5, name: '16.09 Star', x: 50, y: 72, lore: 'The day this universe got a whole lot brighter.' },
]

export function ConstellationStargazer() {
  const [connectedStars, setConnectedStars] = useState<number[]>([1])
  const [isCompleted, setIsCompleted] = useState(false)
  const [wishText, setWishText] = useState('')
  const [savedWish, setSavedWish] = useLocalStorage<string>('bp.birthday_wish', '')
  const [wishSent, setWishSent] = useState(!!savedWish)

  const handleStarClick = (id: number) => {
    if (connectedStars.includes(id)) return

    playSparkle()
    buzz(15)
    const nextList = [...connectedStars, id]
    setConnectedStars(nextList)

    if (nextList.length === STAR_NODES.length) {
      setIsCompleted(true)
      playHarpChord()
      wishBurst()
      buzz([100, 50, 150, 50, 300])
    }
  }

  const handleCastWish = (e: React.FormEvent) => {
    e.preventDefault()
    if (!wishText.trim()) return

    setSavedWish(wishText.trim())
    setWishSent(true)
    playHarpChord()
    wishBurst()
    buzz([100, 100, 250])
  }

  return (
    <section className="relative mx-auto w-full max-w-lg px-5 py-14">
      <SectionHeading
        index="09"
        eyebrow="celestial connection"
        title="Make a Birthday Wish."
        sub="Tap the stars in sequence to trace our constellation across the night sky."
      />

      {/* Interactive Constellation Canvas Box */}
      <div className="relative mt-8 h-80 w-full overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-black via-obsidian to-purple-950/20 p-5 shadow-2xl">
        {/* Background Twinkling Static Stars */}
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-40 animate-pulse"
            style={{
              top: `${(i * 37) % 95}%`,
              left: `${(i * 53) % 95}%`,
              width: `${(i % 3) + 1.5}px`,
              height: `${(i % 3) + 1.5}px`,
              animationDuration: `${2 + (i % 4)}s`,
              animationDelay: `${(i % 5) * 0.4}s`,
            }}
          />
        ))}

        {/* SVG Connection Lines */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none">
          {connectedStars.map((starId, idx) => {
            if (idx === 0) return null
            const prevStar = STAR_NODES.find((s) => s.id === connectedStars[idx - 1])!
            const currStar = STAR_NODES.find((s) => s.id === starId)!
            return (
              <line
                key={`${prevStar.id}-${currStar.id}`}
                x1={`${prevStar.x}%`}
                y1={`${prevStar.y}%`}
                x2={`${currStar.x}%`}
                y2={`${currStar.y}%`}
                stroke="rgba(255, 143, 163, 0.75)"
                strokeWidth="2"
                strokeDasharray="4 3"
                className="animate-pulse"
              />
            )
          })}
        </svg>

        {/* Interactive Star Nodes */}
        {STAR_NODES.map((star) => {
          const isConnected = connectedStars.includes(star.id)
          const isNext =
            !isConnected &&
            STAR_NODES.findIndex((s) => s.id === star.id) === connectedStars.length

          return (
            <div
              key={star.id}
              onClick={() => handleStarClick(star.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none group"
              style={{ top: `${star.y}%`, left: `${star.x}%` }}
            >
              {/* Outer Pulse */}
              {isNext && (
                <div className="absolute -inset-2.5 rounded-full border border-gold/70 animate-ping opacity-60 pointer-events-none" />
              )}

              {/* Star Core */}
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                  isConnected
                    ? 'border-rose bg-rose/30 shadow-[0_0_18px_#ff8fa3] text-white'
                    : isNext
                    ? 'border-gold bg-gold/20 shadow-[0_0_15px_#ffc93c] text-gold animate-bounce'
                    : 'border-white/20 bg-white/5 text-white/30 hover:border-white/40'
                }`}
              >
                <Star
                  size={14}
                  fill={isConnected ? 'currentColor' : 'none'}
                  className={isConnected ? 'text-rose' : ''}
                />
              </div>

              {/* Tooltip Label */}
              <div className="pointer-events-none absolute left-1/2 top-9 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-mono text-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                {star.name}
              </div>
            </div>
          )
        })}

        {/* Status Callout inside canvas */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-white/45">
          <span>
            {isCompleted
              ? '✨ Constellation complete'
              : `Tap star #${connectedStars.length + 1} to connect`}
          </span>
          <span className="font-mono text-rose/70">
            {connectedStars.length} / {STAR_NODES.length} Stars
          </span>
        </div>
      </div>

      {/* Secret Message Unlocked Upon Constellation Completion */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-rose/40 bg-gradient-to-br from-rose/15 via-charcoal to-crimson/10 p-5 text-center shadow-xl backdrop-blur-sm"
          >
            <Sparkles size={20} className="mx-auto mb-2 text-gold animate-spin-slow" />
            <p className="font-display text-[15px] font-medium leading-relaxed text-white/95">
              "Across every light year, under every night sky, my wish was always you."
            </p>
            <p className="mt-1 text-[11.5px] text-white/50 italic">
              — Sealed into the sky on 16.09.2026
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Make Your Birthday Wish Section */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h4 className="font-display text-[15px] font-semibold text-white/90">
          Cast Your Birthday Wish to the Universe 🌠
        </h4>
        <p className="mt-1 text-[12.5px] text-white/50">
          Type your secret birthday wish below. It will be sealed and saved right here.
        </p>

        {!wishSent ? (
          <form onSubmit={handleCastWish} className="mt-4 space-y-3">
            <textarea
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
              placeholder="I wish for..."
              rows={3}
              className="w-full resize-none rounded-xl border border-white/15 bg-black/40 p-3 text-[13.5px] text-white placeholder-white/30 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose"
            />
            <button
              type="submit"
              disabled={!wishText.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose/30 to-crimson/30 border border-rose/40 py-2.5 font-display text-[13px] font-semibold text-white shadow-lg shadow-rose/20 hover:border-rose transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send size={14} />
              <span>Cast Wish to the Stars</span>
            </button>
          </form>
        ) : (
          <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 p-4 text-center">
            <p className="text-[11px] font-mono uppercase tracking-widest text-gold mb-1">
              ✓ Wish Sealed & Cast to the Stars
            </p>
            <p className="font-display text-[14px] text-white/90 italic">
              "{savedWish || wishText}"
            </p>
            <button
              onClick={() => {
                playClick()
                setWishSent(false)
                setWishText(savedWish)
              }}
              className="mt-3 text-[11px] text-white/40 hover:text-white underline cursor-pointer"
            >
              Edit wish
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
