import { useEffect, useState } from 'react'

/**
 * Subtle desktop ambient cursor glow.
 * Only activates on devices with precise pointer / hover capability.
 */
export function CursorGlow() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Disable on touch devices
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return
    }

    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }

    const onLeave = () => setVisible(false)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  if (!visible || !pos) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-500"
      style={{
        opacity: visible ? 1 : 0,
        background: `radial-gradient(550px circle at ${pos.x}px ${pos.y}px, rgba(255, 26, 26, 0.06), rgba(255, 45, 85, 0.02) 40%, transparent 80%)`,
      }}
    />
  )
}
