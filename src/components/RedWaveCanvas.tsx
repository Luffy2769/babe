import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/useReducedMotion'

type Props = {
  /** Height of the wave field as a fraction of the viewport height. */
  heightRatio?: number
  className?: string
  /** Dot density multiplier. Lower on weak devices. */
  density?: number
}

/**
 * The ambient particle grid that sits along the bottom of the screen.
 *
 * A lattice of dots displaced by two out-of-phase sine waves plus a cosine
 * cross-wave, drawn additively so overlapping glows bloom into each other.
 * Everything is DPR-aware, pauses when the tab is hidden, and idles into a
 * single static frame when the OS asks for reduced motion.
 */
export function RedWaveCanvas({ heightRatio = 0.42, className = '', density = 1 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    let cols = 0
    let rows = 0
    let spacing = 26
    let t = 0
    let running = true

    const resize = () => {
      // Cap DPR at 2: a 3x retina phone gains nothing here but pays for it in
      // fill rate, and this canvas runs continuously.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = Math.round(window.innerHeight * heightRatio)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      spacing = (w < 480 ? 22 : w < 900 ? 26 : 30) / density
      cols = Math.ceil(w / spacing) + 2
      rows = Math.ceil(h / spacing) + 2
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      for (let iy = 0; iy < rows; iy++) {
        for (let ix = 0; ix < cols; ix++) {
          const x0 = ix * spacing
          const y0 = iy * spacing

          // Two travelling sines on x, one cosine cross-wave on y.
          const wave =
            Math.sin(x0 * 0.012 + t * 0.9) * 15 +
            Math.sin(x0 * 0.031 - t * 1.4) * 6 +
            Math.cos(y0 * 0.02 + t * 0.6) * 7

          const y = y0 + wave
          if (y < -20 || y > h + 20) continue

          // Fade in with depth (lower rows are "closer" and brighter) and
          // shimmer along the wave crest.
          const depth = iy / rows
          const crest = (Math.sin(x0 * 0.012 + t * 0.9) + 1) / 2
          const alpha = (0.05 + depth * 0.4) * (0.35 + crest * 0.65)
          const r = 0.7 + crest * 1.15 + depth * 0.5

          ctx.beginPath()
          ctx.arc(x0, y, r, 0, Math.PI * 2)
          ctx.fillStyle =
            crest > 0.72
              ? `rgba(255, 90, 110, ${alpha * 1.25})`
              : `rgba(255, 26, 26, ${alpha})`
          ctx.fill()
        }
      }

      // A soft crimson horizon glow welded to the bottom edge.
      const grad = ctx.createLinearGradient(0, h * 0.55, 0, h)
      grad.addColorStop(0, 'rgba(255, 26, 26, 0)')
      grad.addColorStop(1, 'rgba(255, 26, 26, 0.13)')
      ctx.fillStyle = grad
      ctx.fillRect(0, h * 0.55, w, h * 0.45)
      ctx.globalCompositeOperation = 'source-over'
    }

    const loop = () => {
      if (!running) return
      t += 0.016
      draw()
      raf = requestAnimationFrame(loop)
    }

    resize()
    if (reduced) {
      draw() // one static frame
    } else {
      loop()
    }

    const onResize = () => {
      resize()
      if (reduced) draw()
    }
    const onVisibility = () => {
      if (reduced) return
      if (document.visibilityState === 'hidden') {
        running = false
        cancelAnimationFrame(raf)
      } else if (!running) {
        running = true
        loop()
      }
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [heightRatio, density, reduced])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-0 ${className}`}
    />
  )
}
