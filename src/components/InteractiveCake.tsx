import { AnimatePresence, motion } from 'framer-motion'
import { Cake, Mic, MicOff, Sparkles, Wind } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PEOPLE } from '../config'
import { useAudio } from '../hooks/audioContext'
import { useBlowDetector } from '../hooks/useBlowDetector'
import { wishBurst, buzz } from '../lib/celebrate'
import { Modal } from './ui/Modal'
import { NeonButton } from './ui/NeonButton'
import { SectionHeading } from './ui/SectionHeading'

/** Candle x-positions in SVG user units. */
const CANDLES = [110, 150, 190]
const WICK_Y = 92

function Flame({ x, lit, agitation }: { x: number; lit: boolean; agitation: number }) {
  return (
    <AnimatePresence>
      {lit && (
        <motion.g
          exit={{ opacity: 0, scale: 0.2, y: 6 }}
          transition={{ duration: 0.28 }}
          style={{ transformOrigin: `${x}px ${WICK_Y}px` }}
        >
          {/* outer halo */}
          <ellipse cx={x} cy={WICK_Y - 9} rx={9} ry={13} fill="#ff6b3d" opacity={0.18} />
          {/* body — CSS flicker, plus a lean that grows as you blow at it */}
          <motion.g
            className="animate-flicker"
            animate={{ x: agitation * 3.5, skewX: -agitation * 9 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12 }}
            style={{ transformOrigin: `${x}px ${WICK_Y}px` }}
          >
            <path
              d={`M ${x} ${WICK_Y} C ${x - 5.5} ${WICK_Y - 6} ${x - 4.5} ${WICK_Y - 14} ${x} ${WICK_Y - 20} C ${x + 4.5} ${WICK_Y - 14} ${x + 5.5} ${WICK_Y - 6} ${x} ${WICK_Y} Z`}
              fill="#ffc93c"
            />
            <path
              d={`M ${x} ${WICK_Y - 1} C ${x - 3} ${WICK_Y - 5} ${x - 2.4} ${WICK_Y - 10} ${x} ${WICK_Y - 14} C ${x + 2.4} ${WICK_Y - 10} ${x + 3} ${WICK_Y - 5} ${x} ${WICK_Y - 1} Z`}
              fill="#fff3c4"
            />
          </motion.g>
        </motion.g>
      )}
    </AnimatePresence>
  )
}

/** Smoke puffs that rise from a wick the instant its flame dies. */
function Smoke({ x }: { x: number }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={WICK_Y - 4}
          r={2.2 + i * 0.5}
          fill="rgba(220,220,235,0.5)"
          initial={{ opacity: 0.55, scale: 0.5, y: 0, x: 0 }}
          animate={{
            opacity: 0,
            scale: 2.6,
            y: -46 - i * 9,
            // gentle alternating drift so it curls instead of rising straight
            x: (i % 2 === 0 ? 1 : -1) * (5 + i * 2.5),
          }}
          transition={{ duration: 2.4 + i * 0.28, delay: i * 0.11, ease: 'easeOut' }}
        />
      ))}
    </>
  )
}

export function InteractiveCake() {
  const { duck, unduck } = useAudio()
  const [lit, setLit] = useState(true)
  const [celebrating, setCelebrating] = useState(false)
  const duckedRef = useRef(false)

  const extinguish = useCallback(() => {
    setLit(false)
    buzz([40, 30, 120])
    wishBurst()
    window.setTimeout(() => setCelebrating(true), 700)
  }, [])

  const { state, level, start, stop } = useBlowDetector({ onBlow: extinguish })

  // Duck the music while the mic is open, so her breath is what gets measured
  // and the moment goes quiet. Reference-counted in the audio provider.
  useEffect(() => {
    const open = state === 'listening' || state === 'requesting'
    if (open && !duckedRef.current) {
      duck()
      duckedRef.current = true
    } else if (!open && duckedRef.current) {
      unduck()
      duckedRef.current = false
    }
  }, [state, duck, unduck])

  // If she scrolls away or closes the tab mid-listen, restore the music level.
  useEffect(
    () => () => {
      if (duckedRef.current) {
        unduck()
        duckedRef.current = false
      }
    },
    [unduck],
  )

  const listening = state === 'listening'
  const relight = () => {
    setLit(true)
    setCelebrating(false)
  }

  return (
    <section className="mx-auto w-full max-w-lg px-5 py-16">
      <SectionHeading
        index="02"
        eyebrow="make a wish"
        title={
          <>
            Three candles,
            <br />
            <span className="text-white/40">and one actual wish.</span>
          </>
        }
        sub="Tap the button, let it hear you, then blow at your phone like you mean it."
      />

      <div className="glass relative overflow-hidden rounded-2xl px-4 pt-4 pb-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

        {/* warm pool of candlelight behind the cake, fades out when blown */}
        <motion.div
          aria-hidden
          animate={{ opacity: lit ? 1 : 0 }}
          transition={{ duration: 0.9 }}
          className="pointer-events-none absolute top-4 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-ember/25 blur-[60px]"
        />

        <svg
          viewBox="0 0 300 262"
          className="relative block w-full"
          role="img"
          aria-label={lit ? 'A birthday cake with lit candles' : 'A birthday cake, candles blown out'}
        >
          <defs>
            <linearGradient id="tierTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a1a20" />
              <stop offset="100%" stopColor="#161015" />
            </linearGradient>
            <linearGradient id="tierBottom" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#33202a" />
              <stop offset="100%" stopColor="#180f14" />
            </linearGradient>
            <linearGradient id="icing" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff2d55" />
              <stop offset="50%" stopColor="#ff1a1a" />
              <stop offset="100%" stopColor="#ff2d55" />
            </linearGradient>
          </defs>

          {/* candles */}
          {CANDLES.map((x, i) => (
            <g key={x}>
              <rect
                x={x - 4}
                y={WICK_Y + 4}
                width={8}
                height={38}
                rx={2.5}
                fill={i === 1 ? '#f4f4f8' : '#e2e2ea'}
              />
              {/* stripes */}
              <rect x={x - 4} y={WICK_Y + 11} width={8} height={3} fill="#ff2d55" opacity={0.75} />
              <rect x={x - 4} y={WICK_Y + 24} width={8} height={3} fill="#ff2d55" opacity={0.75} />
              <line
                x1={x}
                y1={WICK_Y + 4}
                x2={x}
                y2={WICK_Y - 1}
                stroke="#3a3a44"
                strokeWidth={1.4}
                strokeLinecap="round"
              />
              <Flame x={x} lit={lit} agitation={listening ? level : 0} />
              {!lit && <Smoke x={x} />}
            </g>
          ))}

          {/* top tier */}
          <rect x={90} y={134} width={120} height={46} rx={7} fill="url(#tierTop)" />
          <path
            d="M 90 141 h 120 v 9 q -10 10 -20 0 q -10 10 -20 0 q -10 10 -20 0 q -10 10 -20 0 q -10 10 -20 0 q -10 10 -20 0 z"
            fill="url(#icing)"
            opacity={0.9}
          />
          <rect x={90} y={134} width={120} height={46} rx={7} fill="none" stroke="rgba(255,255,255,0.09)" />

          {/* bottom tier */}
          <rect x={62} y={182} width={176} height={56} rx={8} fill="url(#tierBottom)" />
          <path
            d="M 62 189 h 176 v 10 q -11 11 -22 0 q -11 11 -22 0 q -11 11 -22 0 q -11 11 -22 0 q -11 11 -22 0 q -11 11 -22 0 q -11 11 -22 0 q -11 11 -22 0 z"
            fill="url(#icing)"
            opacity={0.82}
          />
          <rect x={62} y={182} width={176} height={56} rx={8} fill="none" stroke="rgba(255,255,255,0.09)" />

          {/* sprinkles */}
          {[
            [96, 214],
            [124, 224],
            [152, 210],
            [180, 222],
            [208, 212],
            [110, 162],
            [150, 168],
            [190, 160],
          ].map(([sx, sy], i) => (
            <rect
              key={i}
              x={sx}
              y={sy}
              width={5}
              height={1.8}
              rx={0.9}
              fill={i % 2 ? '#ffc93c' : '#ffffff'}
              opacity={0.5}
              transform={`rotate(${i * 37} ${sx} ${sy})`}
            />
          ))}

          {/* plate */}
          <ellipse cx={150} cy={243} rx={112} ry={9} fill="rgba(255,255,255,0.05)" />
          <ellipse
            cx={150}
            cy={243}
            rx={112}
            ry={9}
            fill="none"
            stroke="rgba(255,26,26,0.28)"
            strokeWidth={0.8}
          />
        </svg>

        {/* live breath meter — only meaningful while the mic is open */}
        <AnimatePresence>
          {listening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex items-center gap-3">
                <Wind size={14} className="shrink-0 text-crimson" />
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-crimson to-gold"
                    animate={{ width: `${Math.round(level * 100)}%` }}
                    transition={{ duration: 0.08 }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right font-mono text-[9px] tracking-[0.16em] text-white/35 uppercase">
                  listening
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* controls */}
      <div className="mt-5 flex flex-col items-center gap-3">
        {lit ? (
          listening || state === 'requesting' ? (
            <NeonButton onClick={stop} variant="ghost" icon={<MicOff size={14} />}>
              stop listening
            </NeonButton>
          ) : (
            <NeonButton onClick={() => void start()} icon={<Mic size={14} />}>
              Make a Wish &amp; Blow
            </NeonButton>
          )
        ) : (
          <NeonButton onClick={relight} variant="ghost" icon={<Cake size={14} />}>
            light them again
          </NeonButton>
        )}

        {/* Every path where the mic can't do the job still reaches the payoff. */}
        {lit && (state === 'denied' || state === 'unsupported' || listening) && (
          <button
            onClick={extinguish}
            className="font-mono text-[10px] tracking-[0.18em] text-white/35 uppercase underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/70"
          >
            {state === 'denied'
              ? 'mic blocked — blow them out by tapping here'
              : state === 'unsupported'
                ? 'no mic on this device — tap here instead'
                : 'or just tap here'}
          </button>
        )}

        {state === 'denied' && (
          <p className="max-w-xs text-center text-[11px] leading-relaxed text-white/30">
            Allow microphone access in your browser settings if you want the real thing —
            nothing is recorded or sent anywhere.
          </p>
        )}
      </div>

      <Modal
        open={celebrating}
        onClose={() => setCelebrating(false)}
        eyebrow="wish registered"
        title={`Happy Birthday, ${PEOPLE.recipient.name}`}
      >
        <div className="flex flex-col items-center gap-5 pb-2 text-center">
          <motion.div
            initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className="grid h-16 w-16 place-items-center rounded-full border border-crimson/40 bg-crimson/10"
            style={{ boxShadow: '0 0 40px -8px rgba(255,26,26,0.9)' }}
          >
            <Sparkles size={26} className="text-gold" />
          </motion.div>

          <p className="text-[15px] leading-relaxed text-balance text-white/70">
            You blew them out from {PEOPLE.recipient.city.toLowerCase()} and I felt it from
            here. Whatever you just wished for — I&apos;m officially on the case.
          </p>

          <p className="font-mono text-[10px] tracking-[0.25em] text-white/25 uppercase">
            wish encrypted · do not tell anyone
          </p>

          <NeonButton onClick={() => setCelebrating(false)} full>
            keep going
          </NeonButton>
        </div>
      </Modal>
    </section>
  )
}
