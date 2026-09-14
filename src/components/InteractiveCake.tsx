import { AnimatePresence, motion } from 'framer-motion'
import { Cake, Heart, Mic, MicOff, Sparkles, Wind } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PEOPLE } from '../config'
import { useAudio } from '../hooks/audioContext'
import { useBlowDetector } from '../hooks/useBlowDetector'
import { wishBurst, buzz } from '../lib/celebrate'
import { playChime, playClick, playSparkle, playWhoosh } from '../lib/sfx'
import { Modal } from './ui/Modal'
import { NeonButton } from './ui/NeonButton'
import { SectionHeading } from './ui/SectionHeading'

/** Candle x-positions in SVG user units. */
const CANDLES = [110, 150, 190]
const WICK_Y = 92

function Flame({
  x,
  lit,
  agitation,
  sparkler,
}: {
  x: number
  lit: boolean
  agitation: number
  sparkler?: boolean
}) {
  return (
    <AnimatePresence>
      {lit && (
        <motion.g
          exit={{ opacity: 0, scale: 0.2, y: 6 }}
          transition={{ duration: 0.28 }}
          style={{ transformOrigin: `${x}px ${WICK_Y}px` }}
        >
          {/* outer halo */}
          <ellipse
            cx={x}
            cy={WICK_Y - 9}
            rx={sparkler ? 14 : 9}
            ry={sparkler ? 18 : 13}
            fill={sparkler ? '#ffc93c' : '#ff6b3d'}
            opacity={sparkler ? 0.35 : 0.18}
          />
          {/* body */}
          <motion.g
            className="animate-flicker"
            animate={{ x: agitation * 3.5, skewX: -agitation * 9 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12 }}
            style={{ transformOrigin: `${x}px ${WICK_Y}px` }}
          >
            <path
              d={`M ${x} ${WICK_Y} C ${x - 5.5} ${WICK_Y - 6} ${x - 4.5} ${WICK_Y - 14} ${x} ${WICK_Y - 20} C ${x + 4.5} ${WICK_Y - 14} ${x + 5.5} ${WICK_Y - 6} ${x} ${WICK_Y} Z`}
              fill={sparkler ? '#ffffff' : '#ffc93c'}
            />
            <path
              d={`M ${x} ${WICK_Y - 1} C ${x - 3} ${WICK_Y - 5} ${x - 2.4} ${WICK_Y - 10} ${x} ${WICK_Y - 14} C ${x + 2.4} ${WICK_Y - 10} ${x + 3} ${WICK_Y - 5} ${x} ${WICK_Y - 1} Z`}
              fill={sparkler ? '#ffeb99' : '#fff3c4'}
            />
          </motion.g>

          {/* Sparkler particles */}
          {sparkler && (
            <>
              {[-6, 0, 6].map((offset, idx) => (
                <motion.circle
                  key={idx}
                  cx={x + offset}
                  cy={WICK_Y - 16}
                  r={1.2}
                  fill="#fff"
                  animate={{
                    y: [-4, -20 - idx * 5, -30],
                    x: [0, (idx - 1) * 12, (idx - 1) * 18],
                    opacity: [1, 0.8, 0],
                    scale: [1, 1.5, 0.2],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8 + idx * 0.2,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}
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
  const [sparklerMode, setSparklerMode] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [customWish, setCustomWish] = useState('')
  const [wishSealed, setWishSealed] = useState(false)
  const duckedRef = useRef(false)

  const extinguish = useCallback(() => {
    setLit(false)
    playWhoosh()
    buzz([40, 30, 120])
    wishBurst()
    window.setTimeout(() => setCelebrating(true), 700)
  }, [])

  const { state, level, start, stop } = useBlowDetector({ onBlow: extinguish })

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

  const relight = () => {
    playSparkle()
    buzz(25)
    setLit(true)
    setWishSealed(false)
  }

  const toggleSparkler = () => {
    playClick()
    setSparklerMode((prev) => !prev)
    if (!sparklerMode) playSparkle()
  }

  const handleSealWish = () => {
    playChime()
    buzz([50, 50, 150])
    wishBurst()
    setWishSealed(true)
    try {
      localStorage.setItem('bp.wish_sealed', customWish || 'secret-wish')
    } catch {
      /* ignore */
    }
  }

  const listening = state === 'listening'
  const agitation = listening ? Math.min(1, level * 1.8) : 0

  return (
    <section className="mx-auto w-full max-w-lg px-5 py-16">
      <SectionHeading
        index="02"
        eyebrow="the cake"
        title="Make a wish."
        sub="Blow into your mic to extinguish the candles — or tap them if you're in public."
      />

      <div className="glass relative overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson/50 to-transparent" />

        {/* Ambient flame cast glow */}
        {lit && (
          <div
            className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-44 w-64 rounded-full blur-3xl transition-opacity duration-700"
            style={{
              background: sparklerMode
                ? 'radial-gradient(circle, rgba(255,201,60,0.3) 0%, rgba(255,255,255,0.1) 60%, transparent 80%)'
                : 'radial-gradient(circle, rgba(255,45,85,0.22) 0%, rgba(255,107,61,0.15) 50%, transparent 75%)',
            }}
          />
        )}

        <svg
          viewBox="0 0 300 270"
          className="mx-auto block h-64 w-full max-w-[320px] cursor-pointer"
          onClick={lit ? extinguish : relight}
          role="img"
          aria-label={
            lit
              ? 'Birthday cake with three lit candles'
              : 'Birthday cake with candles blown out'
          }
        >
          <defs>
            <linearGradient id="candle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#ff1a1a" />
            </linearGradient>
            <linearGradient id="tierTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1a22" />
              <stop offset="100%" stopColor="#111116" />
            </linearGradient>
            <linearGradient id="tierBottom" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#17171e" />
              <stop offset="100%" stopColor="#0e0e13" />
            </linearGradient>
            <linearGradient id="icing" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff1a1a" />
              <stop offset="50%" stopColor="#ff2d55" />
              <stop offset="100%" stopColor="#ff6b3d" />
            </linearGradient>
          </defs>

          {/* flames + smoke */}
          {CANDLES.map((x) => (
            <Flame
              key={`flame-${x}`}
              x={x}
              lit={lit}
              agitation={agitation}
              sparkler={sparklerMode}
            />
          ))}
          {!lit && CANDLES.map((x) => <Smoke key={`smoke-${x}`} x={x} />)}

          {/* wicks */}
          {CANDLES.map((x) => (
            <line
              key={`wick-${x}`}
              x1={x}
              y1={WICK_Y}
              x2={x}
              y2={WICK_Y + 7}
              stroke="#555562"
              strokeWidth={1.4}
              strokeLinecap="round"
            />
          ))}

          {/* candles */}
          {CANDLES.map((x) => (
            <g key={`candle-${x}`}>
              <rect
                x={x - 4}
                y={WICK_Y + 7}
                width={8}
                height={38}
                rx={2.5}
                fill="url(#candle)"
              />
              <line
                x1={x - 2}
                y1={WICK_Y + 11}
                x2={x + 2}
                y2={WICK_Y + 15}
                stroke="#ffffff"
                strokeWidth={0.8}
                opacity={0.65}
              />
              <line
                x1={x - 2}
                y1={WICK_Y + 23}
                x2={x + 2}
                y2={WICK_Y + 27}
                stroke="#ffffff"
                strokeWidth={0.8}
                opacity={0.65}
              />
            </g>
          ))}

          {/* top tier */}
          <rect x={90} y={134} width={120} height={46} rx={7} fill="url(#tierTop)" />
          <path
            d="M 90 141 h 120 v 8 q -8 8 -15 0 q -8 8 -15 0 q -8 8 -15 0 q -8 8 -15 0 q -8 8 -15 0 q -8 8 -15 0 q -8 8 -15 0 q -8 8 -15 0 z"
            fill="url(#icing)"
            opacity={0.9}
          />
          <rect
            x={90}
            y={134}
            width={120}
            height={46}
            rx={7}
            fill="none"
            stroke="rgba(255,255,255,0.09)"
          />

          {/* bottom tier */}
          <rect x={62} y={182} width={176} height={56} rx={8} fill="url(#tierBottom)" />
          <path
            d="M 62 189 h 176 v 10 q -11 11 -22 0 q -11 11 -22 0 q -11 11 -22 0 q -11 11 -22 0 q -11 11 -22 0 q -11 11 -22 0 q -11 11 -22 0 q -11 11 -22 0 z"
            fill="url(#icing)"
            opacity={0.82}
          />
          <rect
            x={62}
            y={182}
            width={176}
            height={56}
            rx={8}
            fill="none"
            stroke="rgba(255,255,255,0.09)"
          />

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

        {/* live breath meter */}
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
        <div className="flex flex-wrap items-center justify-center gap-2">
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
            <NeonButton onClick={relight} variant="solid" icon={<Cake size={14} />}>
              Light Them Again
            </NeonButton>
          )}

          {lit && (
            <button
              onClick={toggleSparkler}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase transition-all ${
                sparklerMode
                  ? 'border-gold bg-gold/15 text-gold shadow-[0_0_15px_rgba(255,201,60,0.3)]'
                  : 'border-white/15 bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              <Sparkles size={12} />
              {sparklerMode ? 'sparklers on' : 'add sparklers'}
            </button>
          )}
        </div>

        {lit && (
          <button
            onClick={extinguish}
            className="font-mono text-[10px] tracking-[0.18em] text-white/35 uppercase underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/70"
          >
            {state === 'denied'
              ? 'mic blocked — blow them out by tapping here'
              : state === 'unsupported'
                ? 'no mic on this device — tap here instead'
                : 'or just tap the cake'}
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

          <p className="text-[15px] leading-relaxed text-balance text-white/75">
            You blew them out from {PEOPLE.recipient.city.toLowerCase()} and I felt it from
            here. Whatever you just wished for — I&apos;m officially on the case.
          </p>

          {/* Interactive Wish Input Box */}
          <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left">
            <label className="hud-label text-[10px] block mb-2 text-white/50">
              Seal a Private Wish (Optional)
            </label>
            {wishSealed ? (
              <div className="flex items-center gap-2 text-gold font-mono text-[12px] py-1">
                <Heart size={14} className="text-crimson" fill="currentColor" />
                <span>Wish locked &amp; encrypted in the cosmos.</span>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customWish}
                  onChange={(e) => setCustomWish(e.target.value)}
                  placeholder="Type a secret wish or keep it unspoken..."
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-[13px] text-white placeholder-white/25 focus:border-crimson focus:outline-none"
                />
                <button
                  onClick={handleSealWish}
                  className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-crimson hover:text-white transition-colors cursor-pointer"
                >
                  <Sparkles size={12} />
                  [ Seal My Wish With Stars ]
                </button>
              </div>
            )}
          </div>

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
