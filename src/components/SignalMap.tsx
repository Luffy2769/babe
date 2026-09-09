import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DISTANCE_KM, PEOPLE } from '../config'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { buzz } from '../lib/celebrate'
import { NeonButton } from './ui/NeonButton'
import { SectionHeading } from './ui/SectionHeading'

const VB = { w: 360, h: 230, pad: 34 }

/**
 * Bounding box derived from the two coordinates rather than hard-coded, with
 * enough margin that neither node crowds an edge. Change a city in config and
 * the map reframes itself.
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

/** Plain equirectangular projection — enough to be geographically honest. */
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
// Control point lifted above the chord gives the trajectory its flight-path arc.
const CTRL = { x: (A.x + B.x) / 2, y: Math.min(A.y, B.y) - 62 }
const CURVE = `M ${A.x} ${A.y} Q ${CTRL.x} ${CTRL.y} ${B.x} ${B.y}`

const TRAVEL_MS = 1900

function Node({
  x,
  y,
  label,
  sub,
  accent,
  pulsing,
}: {
  x: number
  y: number
  label: string
  sub: string
  accent: boolean
  pulsing: boolean
}) {
  const color = accent ? '#ff1a1a' : '#ffffff'
  return (
    <g>
      {pulsing && (
        <circle
          cx={x}
          cy={y}
          r={6}
          fill="none"
          stroke={color}
          strokeWidth={1}
          className="animate-pulse-ring"
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
      )}
      <circle cx={x} cy={y} r={11} fill={color} opacity={0.1} />
      <circle cx={x} cy={y} r={4} fill={color}>
        <animate
          attributeName="opacity"
          values="1;0.55;1"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx={x} cy={y} r={4} fill="none" stroke={color} strokeWidth={0.6} opacity={0.6} />
      <text
        x={x}
        y={y + 22}
        textAnchor="middle"
        fill={accent ? '#ff6b7a' : 'rgba(255,255,255,0.75)'}
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
        fill="rgba(255,255,255,0.3)"
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

  const send = useCallback(() => {
    const path = pathRef.current
    const packet = packetRef.current
    if (!path || !packet || flying) return

    const total = path.getTotalLength()
    const startedAt = performance.now()
    setFlying(true)
    setArrived(false)
    buzz(18) // a tick as it leaves

    const step = (nowTs: number) => {
      const p = Math.min(1, (nowTs - startedAt) / TRAVEL_MS)
      // easeInOutCubic — launches, cruises, decelerates into the node.
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
      const pt = path.getPointAtLength(e * total)
      packet.setAttribute('transform', `translate(${pt.x} ${pt.y})`)

      if (p < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setFlying(false)
        setArrived(true)
        setCount((c) => c + 1)
        // The payoff: the phone buzzes as the packet lands on her node.
        buzz([100, 50, 100])
        window.setTimeout(() => setArrived(false), 2600)
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }, [flying, setCount])

  // Park the packet on the origin node before the first launch.
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
            {DISTANCE_KM.toLocaleString()} km,
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
              <stop offset="55%" stopColor="#ff2d55" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ff1a1a" stopOpacity="0.9" />
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

          {/* equator + a couple of graticules, for coordinate-plot flavour */}
          <line
            x1="0"
            y1={project(0, 0).y}
            x2={VB.w}
            y2={project(0, 0).y}
            stroke="rgba(255,26,26,0.16)"
            strokeWidth="0.6"
            strokeDasharray="4 5"
          />
          <text
            x="6"
            y={project(0, 0).y - 4}
            fill="rgba(255,255,255,0.18)"
            fontSize="6.5"
            letterSpacing="1.5"
            fontFamily="JetBrains Mono, monospace"
          >
            EQUATOR
          </text>

          {/* the trajectory: a soft under-glow beneath the dashed flight path */}
          <path d={CURVE} fill="none" stroke="#ff1a1a" strokeWidth="5" opacity="0.09" />
          <path
            ref={pathRef}
            d={CURVE}
            fill="none"
            stroke="url(#pathGrad)"
            strokeWidth="1.2"
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
          />
          <Node
            x={B.x}
            y={B.y}
            label={PEOPLE.recipient.city}
            sub={PEOPLE.recipient.region}
            accent
            pulsing={arrived}
          />

          {/* the packet itself — moved imperatively along the path each frame */}
          <g ref={packetRef} opacity={flying ? 1 : 0} style={{ transition: 'opacity 200ms' }}>
            <circle r="13" fill="url(#packetGlow)" />
            <circle r="3.2" fill="#fff" />
            <circle r="5.5" fill="none" stroke="#ff2d55" strokeWidth="0.8" opacity="0.8" />
          </g>

          {/* impact ring at the destination */}
          {arrived && (
            <circle
              cx={B.x}
              cy={B.y}
              r="6"
              fill="none"
              stroke="#ff1a1a"
              strokeWidth="1.2"
              className="animate-pulse-ring"
              style={{ transformOrigin: `${B.x}px ${B.y}px` }}
            />
          )}
        </svg>

        {/* readout strip under the plate */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
          <span className="font-mono text-[10px] tracking-[0.18em] text-white/30 uppercase">
            {flying ? 'transmitting…' : arrived ? 'delivered ✓' : 'link idle'}
          </span>
          <span className="font-mono text-[10px] tracking-[0.18em] text-white/30 uppercase">
            {count} sent
          </span>
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <NeonButton onClick={send} disabled={flying} icon={<Send size={14} />}>
          {flying ? 'sending' : 'Send Signal'}
        </NeonButton>
      </div>

      <AnimatePresence>
        {arrived && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center font-mono text-[11px] tracking-[0.18em] text-crimson uppercase"
          >
            received in {PEOPLE.recipient.city.toLowerCase()}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  )
}
