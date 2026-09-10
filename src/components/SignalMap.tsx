import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Info, Radio, Send } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DISTANCE_KM, PEOPLE } from '../config'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { buzz } from '../lib/celebrate'
import { playClick, playRadarPing, playSparkle } from '../lib/sfx'
import { SecretTelemetryModal } from './SecretTelemetryModal'
import { NeonButton } from './ui/NeonButton'
import { SectionHeading } from './ui/SectionHeading'

const VB = { w: 360, h: 230, pad: 34 }

/**
 * Bounding box derived from the two coordinates rather than hard-coded, with
 * enough margin that neither node crowds an edge.
 */
const BOUNDS = (() => {
  const a = PEOPLE.sender.coords
  const b = PEOPLE.recipient.coords
  const lonPad = Math.max(Math.abs(a.lon - b.lon) * 0.16, 3)
  const latPad = Math.max(Math.abs(a.lat - b.lat) * 0.28, 4)
  return {
    lonMin: Math.min(a.lon, b.lon) - lonPad,
    lonMax: Math.max(a.lon, b.lon) + lonPad,
    latMin: Math.min(a.lat, b.lat) - latPad,
    latMax: Math.max(a.lat, b.lat) + latPad,
  }
})()

/** Plain equirectangular projection */
function project(lat: number, lon: number) {
  const { w, h, pad } = VB
  const x =
    ((lon - BOUNDS.lonMin) / (BOUNDS.lonMax - BOUNDS.lonMin)) * (w - pad * 2) + pad
  const y =
    ((BOUNDS.latMax - lat) / (BOUNDS.latMax - BOUNDS.latMin)) * (h - pad * 2) + pad
  return { x, y }
}

const A = project(PEOPLE.sender.coords.lat, PEOPLE.sender.coords.lon)
const B = project(PEOPLE.recipient.coords.lat, PEOPLE.recipient.coords.lon)
const CTRL = { x: (A.x + B.x) / 2, y: Math.min(A.y, B.y) - 62 }
const CURVE = `M ${A.x} ${A.y} Q ${CTRL.x} ${CTRL.y} ${B.x} ${B.y}`

const TRAVEL_MS = 1800

function Node({
  x,
  y,
  label,
  sub,
  accent,
  pulsing,
  onClick,
}: {
  x: number
  y: number
  label: string
  sub: string
  accent: boolean
  pulsing: boolean
  onClick?: () => void
}) {
  const color = accent ? '#ff1a1a' : '#ffffff'
  return (
    <g onClick={onClick} className="cursor-pointer group">
      {pulsing && (
        <circle
          cx={x}
          cy={y}
          r={6}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          className="animate-pulse-ring"
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
      )}
      <circle cx={x} cy={y} r={14} fill={color} opacity={0.06} className="transition-all group-hover:opacity-20" />
      <circle cx={x} cy={y} r={10} fill={color} opacity={0.12} />
      <circle cx={x} cy={y} r={4} fill={color}>
        <animate
          attributeName="opacity"
          values="1;0.55;1"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx={x} cy={y} r={4} fill="none" stroke={color} strokeWidth={0.8} opacity={0.7} />
      <text
        x={x}
        y={y + 22}
        textAnchor="middle"
        fill={accent ? '#ff6b7a' : 'rgba(255,255,255,0.85)'}
        fontSize={9}
        letterSpacing={2}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={700}
      >
        {label}
      </text>
      <text
        x={x}
        y={y + 33}
        textAnchor="middle"
        fill="rgba(255,255,255,0.4)"
        fontSize={7}
        letterSpacing={1}
        fontFamily="JetBrains Mono, monospace"
      >
        {sub}
      </text>
    </g>
  )
}

export function SignalMap() {
  const pathRef = useRef<SVGPathElement>(null)
  const packetRef = useRef<SVGGElement>(null)
  const rafRef = useRef(0)
  const [flying, setFlying] = useState(false)
  const [arrived, setArrived] = useState(false)
  const [count, setCount] = useLocalStorage('bp.signals', 0)
  const [telemetryOpen, setTelemetryOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<'sender' | 'recipient' | null>(null)

  const send = useCallback(() => {
    const path = pathRef.current
    const packet = packetRef.current
    if (!path || !packet || flying) return

    const total = path.getTotalLength()
    const startedAt = performance.now()
    setFlying(true)
    setArrived(false)
    buzz(18)
    playRadarPing()

    const step = (nowTs: number) => {
      const p = Math.min(1, (nowTs - startedAt) / TRAVEL_MS)
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
      const pt = path.getPointAtLength(e * total)
      packet.setAttribute('transform', `translate(${pt.x} ${pt.y})`)

      if (p < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setFlying(false)
        setArrived(true)
        setCount((c) => c + 1)
        buzz([100, 50, 100])
        playSparkle()
        window.setTimeout(() => setArrived(false), 3200)
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }, [flying, setCount])

  useEffect(() => {
    packetRef.current?.setAttribute('transform', `translate(${A.x} ${A.y})`)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <section className="mx-auto w-full max-w-lg px-5 py-16">
      <SectionHeading
        index="01"
        eyebrow="signal path"
        title={
          <>
            <span
              onClick={() => setTelemetryOpen(true)}
              title="Double click for secret telemetry"
              className="group inline-flex cursor-pointer items-center gap-2 transition-colors hover:text-crimson"
            >
              {DISTANCE_KM.toLocaleString()} km
              <Activity size={18} className="text-crimson/70 group-hover:scale-125 transition-transform" />
            </span>
            <br />
            <span className="text-white/40">and no latency that matters.</span>
          </>
        }
        sub="Send one and watch it cross. Your phone will feel it land."
      />

      <div className="glass relative overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson/50 to-transparent" />

        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="block w-full"
          role="img"
          aria-label={`Map showing a signal path from ${PEOPLE.sender.city} to ${PEOPLE.recipient.city}`}
        >
          <defs>
            <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="55%" stopColor="#ff2d55" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#ff1a1a" stopOpacity="0.95" />
            </linearGradient>
            <radialGradient id="packetGlow">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="35%" stopColor="#ff2d55" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ff1a1a" stopOpacity="0" />
            </radialGradient>
            <pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse">
              <path
                d="M 18 0 L 0 0 0 18"
                fill="none"
                stroke="rgba(255,255,255,0.055)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          <rect width={VB.w} height={VB.h} fill="url(#grid)" />

          {/* Equator */}
          <line
            x1="0"
            y1={project(0, 0).y}
            x2={VB.w}
            y2={project(0, 0).y}
            stroke="rgba(255,26,26,0.2)"
            strokeWidth="0.7"
            strokeDasharray="4 5"
          />
          <text
            x="6"
            y={project(0, 0).y - 4}
            fill="rgba(255,255,255,0.25)"
            fontSize="6.5"
            letterSpacing="1.5"
            fontFamily="JetBrains Mono, monospace"
          >
            EQUATOR (LAT 0°00')
          </text>

          {/* Underglow + trajectory path */}
          <path d={CURVE} fill="none" stroke="#ff1a1a" strokeWidth="6" opacity="0.12" />
          <path
            ref={pathRef}
            d={CURVE}
            fill="none"
            stroke="url(#pathGrad)"
            strokeWidth="1.4"
            strokeDasharray="5 6"
            strokeLinecap="round"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="22;0"
              dur="1.4s"
              repeatCount="indefinite"
            />
          </path>

          <Node
            x={A.x}
            y={A.y}
            label={PEOPLE.sender.city}
            sub={PEOPLE.sender.region}
            accent={false}
            pulsing={flying}
            onClick={() => {
              playClick()
              setSelectedNode(selectedNode === 'sender' ? null : 'sender')
            }}
          />
          <Node
            x={B.x}
            y={B.y}
            label={PEOPLE.recipient.city}
            sub={PEOPLE.recipient.region}
            accent
            pulsing={arrived}
            onClick={() => {
              playClick()
              setSelectedNode(selectedNode === 'recipient' ? null : 'recipient')
            }}
          />

          {/* The traveling packet */}
          <g ref={packetRef} opacity={flying ? 1 : 0} style={{ transition: 'opacity 200ms' }}>
            <circle r="15" fill="url(#packetGlow)" />
            <circle r="3.5" fill="#fff" />
            <circle r="6" fill="none" stroke="#ff2d55" strokeWidth="1" opacity="0.9" />
          </g>

          {/* Multi-ring destination ripple on arrival */}
          {arrived && (
            <g>
              <circle
                cx={B.x}
                cy={B.y}
                r="8"
                fill="none"
                stroke="#ff1a1a"
                strokeWidth="1.5"
                className="animate-pulse-ring"
                style={{ transformOrigin: `${B.x}px ${B.y}px` }}
              />
              <circle
                cx={B.x}
                cy={B.y}
                r="16"
                fill="none"
                stroke="#ffc93c"
                strokeWidth="0.8"
                className="animate-pulse-ring"
                style={{ transformOrigin: `${B.x}px ${B.y}px`, animationDelay: '200ms' }}
              />
            </g>
          )}
        </svg>

        {/* Selected Node Details Bar */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 bg-white/5 px-4 py-2.5 font-mono text-[10px]"
            >
              {selectedNode === 'sender' ? (
                <div className="flex items-center justify-between text-white/70">
                  <span>
                    ORIGIN: {PEOPLE.sender.city} ({PEOPLE.sender.coords.lat}°, {PEOPLE.sender.coords.lon}°)
                  </span>
                  <span className="text-white/40">{PEOPLE.sender.zoneLabel}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-crimson">
                  <span>
                    TARGET: {PEOPLE.recipient.name} in {PEOPLE.recipient.city} ({PEOPLE.recipient.coords.lat}°, {PEOPLE.recipient.coords.lon}°)
                  </span>
                  <span className="text-gold">{PEOPLE.recipient.zoneLabel}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Readout strip & telemetry packet status */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Radio size={12} className={flying ? 'text-crimson animate-pulse' : 'text-white/40'} />
            <span className="font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">
              {flying ? 'packet traversing ocean…' : arrived ? 'delivered to her node ✓' : 'carrier link idle'}
            </span>
          </div>
          <button
            onClick={() => setTelemetryOpen(true)}
            className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase hover:text-crimson transition-colors"
          >
            <Info size={11} />
            {count} sent
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        <NeonButton onClick={send} disabled={flying} icon={<Send size={14} />}>
          {flying ? 'transmitting' : 'Send Signal'}
        </NeonButton>

        <p className="font-mono text-[9px] tracking-wider text-white/25 uppercase">
          tip: tap coordinates or distance to inspect telemetry
        </p>
      </div>

      <AnimatePresence>
        {arrived && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center"
          >
            <p className="font-mono text-[11px] tracking-[0.2em] text-crimson uppercase font-bold">
              SIGNAL RECEIVED IN {PEOPLE.recipient.city} // {PEOPLE.recipient.name}
            </p>
            <p className="font-mono text-[9px] tracking-wider text-white/40 mt-0.5">
              traversed across {DISTANCE_KM.toLocaleString()} km in zero heart-lag
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <SecretTelemetryModal open={telemetryOpen} onClose={() => setTelemetryOpen(false)} />
    </section>
  )
}
