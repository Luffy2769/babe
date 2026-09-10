import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/useReducedMotion'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  baseAlpha: number
  twinkleSpeed: number
  color: string
}

const COLORS = [
  'rgba(255, 26, 26, ',   // crimson
  'rgba(255, 107, 61, ',  // ember
  'rgba(255, 201, 60, ',  // gold
  'rgba(255, 255, 255, ', // stardust white
  'rgba(255, 45, 85, ',   // blood
]

/**
 * Atmospheric background stardust & cyber-embers.
 * Renders floating, glowing particles that drift across the screen like signals through the night.
 */
export function ParticlesLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId = 0
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const onResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    // Mouse coordinates for gentle interaction
    let mouseX = -1000
    let mouseY = -1000
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    const count = Math.min(Math.floor((width * height) / 28000), 45)
    const particles: Particle[] = []

    for (let i = 0; i < count; i++) {
      const baseAlpha = 0.15 + Math.random() * 0.45
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.2 - Math.random() * 0.45, // drift upward
        radius: 0.8 + Math.random() * 1.8,
        alpha: baseAlpha,
        baseAlpha,
        twinkleSpeed: 0.01 + Math.random() * 0.03,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })
    }

    let t = 0
    const render = () => {
      if (document.hidden) {
        rafId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, width, height)
      t += 0.02

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Upward and gentle sway motion
        p.y += p.vy
        p.x += p.vx + Math.sin(t + i) * 0.25

        // Gentle cursor push
        const dx = p.x - mouseX
        const dy = p.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100 && dist > 0) {
          const force = (100 - dist) / 100
          p.x += (dx / dist) * force * 1.5
          p.y += (dy / dist) * force * 1.5
        }

        // Wrap around boundaries
        if (p.y < -10) p.y = height + 10
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10

        // Twinkle
        p.alpha = p.baseAlpha + Math.sin(t * 1.5 + i * 2) * 0.18
        const currentAlpha = Math.max(0.05, Math.min(0.85, p.alpha))

        // Draw particle with soft glow halo
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${currentAlpha})`
        ctx.fill()

        // Outer bloom for larger embers
        if (p.radius > 1.4) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2)
          ctx.fillStyle = `${p.color}${currentAlpha * 0.2})`
          ctx.fill()
        }
      }

      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [reduced])

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[2] opacity-85"
    />
  )
}
