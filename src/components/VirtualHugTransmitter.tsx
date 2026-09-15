import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { DISTANCE_KM, PEOPLE } from '../config'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { buzz, wishBurst } from '../lib/celebrate'
import { playChime, playClick, playHeartbeat, playRadarPing } from '../lib/sfx'
import { SectionHeading } from './ui/SectionHeading'

type TouchMode = 'hug' | 'kiss' | 'hand' | 'tuck'

interface TouchPreset {
  id: TouchMode
  name: string
  verb: string
  sub: string
  icon: string
  haptic: number[]
}

const PRESETS: TouchPreset[] = [
  {
    id: 'hug',
    name: 'Bear Hug',
    verb: 'Transmitting tight bear hug',
    sub: 'Full body warmth, refusing to let go first.',
    icon: '🫂',
    haptic: [150, 100, 200, 100, 300],
  },
  {
    id: 'kiss',
    name: 'Forehead Kiss',
    verb: 'Delivering gentle forehead kiss',
    sub: 'Soft, slow, and telling you everything is okay.',
    icon: '✨',
    haptic: [80, 80, 80],
  },
  {
    id: 'hand',
    name: 'Hand Squeeze',
    verb: 'Interlocking fingers across 5,000 km',
    sub: 'Three quick squeezes: I - Love - You.',
    icon: '🤝',
    haptic: [100, 60, 100, 60, 100],
  },
  {
    id: 'tuck',
    name: 'Tuck In',
    verb: 'Tucking you under the warm duvet',
    sub: 'Pulling the blanket up and whispering sleep tight.',
    icon: '🌙',
    haptic: [200, 150, 250],
  },
]

export function VirtualHugTransmitter() {
  const [selectedMode, setSelectedMode] = useState<TouchMode>('hug')
  const [isHolding, setIsHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [delivered, setDelivered] = useState(false)
  const [hugCount, setHugCount] = useLocalStorage<number>('bp.hug_count', 42)

  const intervalRef = useRef<number | null>(null)
  const heartbeatIntervalRef = useRef<number | null>(null)

  const activePreset = PRESETS.find((p) => p.id === selectedMode) || PRESETS[0]

  const startHolding = () => {
    if (delivered) return
    setIsHolding(true)
    setProgress(0)
    playHeartbeat()
    buzz(activePreset.haptic)

    // Repeat heartbeat sound every 700ms while holding
    heartbeatIntervalRef.current = window.setInterval(() => {
      playHeartbeat()
    }, 700)

    const startTime = Date.now()
    const targetDuration = 2600 // 2.6 seconds hold

    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min(100, (elapsed / targetDuration) * 100)
      setProgress(pct)

      if (pct >= 100) {
        completeTransmission()
      }
    }, 25)
  }

  const stopHolding = () => {
    if (delivered) return
    setIsHolding(false)
    setProgress(0)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
  }

  const completeTransmission = () => {
    setIsHolding(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)

    setDelivered(true)
    playChime()
    playRadarPing()
    wishBurst()
    buzz([200, 100, 300, 100, 500])
    setHugCount((prev) => prev + 1)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
    }
  }, [])

  return (
    <section className="relative mx-auto w-full max-w-lg px-5 py-14">
      <SectionHeading
        index="05"
        eyebrow="haptic telemetry"
        title="Long-Distance Touch."
        sub={`Hold your thumb down to send a pulse across ${DISTANCE_KM.toLocaleString()} km of ocean.`}
      />

      {/* Preset Selector */}
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {PRESETS.map((preset) => {
          const isActive = selectedMode === preset.id
          return (
            <button
              key={preset.id}
              onClick={() => {
                playClick()
                setSelectedMode(preset.id)
                setDelivered(false)
              }}
              className={`flex flex-col items-center rounded-2xl p-3 text-center transition-all cursor-pointer ${
                isActive
                  ? 'border border-rose/50 bg-rose/15 text-white shadow-lg shadow-rose/20'
                  : 'border border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              <span className="text-xl mb-1">{preset.icon}</span>
              <span className="text-[12px] font-semibold">{preset.name}</span>
            </button>
          )
        })}
      </div>

      {/* Main Touch Sensor Pad */}
      <div className="relative mt-10 flex flex-col items-center">
        {/* Animated Radial Rings */}
        <div className="relative flex items-center justify-center">
          <AnimatePresence>
            {isHolding && (
              <>
                {[0, 1, 2].map((ring) => (
                  <motion.div
                    key={ring}
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.8,
                      delay: ring * 0.55,
                      ease: 'easeOut',
                    }}
                    className="pointer-events-none absolute h-44 w-44 rounded-full border border-rose/40"
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Progress Circular SVG Ring */}
          <svg className="h-56 w-56 -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="94"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="112"
              cy="112"
              r="94"
              stroke="#ff2d55"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 94}
              strokeDashoffset={2 * Math.PI * 94 * (1 - progress / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-75"
            />
          </svg>

          {/* Touch Pad Button */}
          <motion.div
            onMouseDown={startHolding}
            onMouseUp={stopHolding}
            onMouseLeave={stopHolding}
            onTouchStart={startHolding}
            onTouchEnd={stopHolding}
            whileTap={{ scale: 0.94 }}
            className={`absolute flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-full border border-white/20 select-none shadow-2xl transition-all ${
              isHolding
                ? 'bg-gradient-to-br from-crimson/50 via-rose/40 to-black scale-95 shadow-[0_0_50px_rgba(255,45,85,0.6)]'
                : 'bg-gradient-to-br from-charcoal via-obsidian to-black hover:border-white/40 shadow-[0_0_30px_rgba(0,0,0,0.8)]'
            }`}
          >
            <motion.div
              animate={{
                scale: isHolding ? [1, 1.2, 1] : [1, 1.05, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: isHolding ? 0.7 : 2.5,
                ease: 'easeInOut',
              }}
            >
              <Heart
                size={38}
                className={isHolding ? 'text-white drop-shadow-[0_0_12px_#fff]' : 'text-rose'}
                fill="currentColor"
              />
            </motion.div>

            <p className="mt-2 font-display text-[12px] font-semibold tracking-wider uppercase text-white/90">
              {isHolding ? `${Math.round(progress)}%` : 'HOLD TO TOUCH'}
            </p>
          </motion.div>
        </div>

        {/* Status Text / Live Feed */}
        <div className="mt-6 text-center">
          <p className="font-display text-[14.5px] font-medium text-white/90">
            {delivered
              ? '✨ Hug successfully landed in Sampit!'
              : isHolding
              ? `${activePreset.verb}...`
              : activePreset.sub}
          </p>

          <div className="mt-2 flex items-center justify-center gap-2 text-[12px] text-white/45">
            <span>{PEOPLE.sender.city}</span>
            <motion.span
              animate={{ x: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            >
              →
            </motion.span>
            <span>{PEOPLE.recipient.city}</span>
            <span>•</span>
            <span className="text-rose/80 font-mono">{DISTANCE_KM.toLocaleString()} km</span>
          </div>
        </div>

        {/* Delivered Success Message */}
        <AnimatePresence>
          {delivered && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 w-full rounded-2xl border border-rose/30 bg-gradient-to-r from-rose/15 via-charcoal to-crimson/15 p-4 text-center backdrop-blur-sm"
            >
              <p className="text-[13.5px] leading-relaxed text-white/90">
                You just held my hand through the screen. I hope you felt every bit of that warmth.
              </p>
              <button
                onClick={() => {
                  playClick()
                  setDelivered(false)
                }}
                className="mt-3 text-[12px] font-medium text-rose hover:text-white underline cursor-pointer"
              >
                Send another one
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Hugs Counter */}
        <div className="mt-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[12px] text-white/50">
          <Zap size={13} className="text-gold" />
          <span>Hugs & touches sent across the ocean:</span>
          <span className="font-mono font-bold text-white/90">{hugCount}</span>
        </div>
      </div>
    </section>
  )
}
