import confetti from 'canvas-confetti'

const SKY_BLUE = ['#38bdf8', '#0ea5e9', '#7dd3fc', '#0284c7', '#00f0ff', '#ffffff']

/** Fullscreen sky-blue-and-starlight burst for the midnight rollover. */
export function midnightBurst() {
  const end = Date.now() + 2600

  // Opening slam from both bottom corners.
  const wings = (particleRatio: number, opts: confetti.Options) => {
    void confetti({
      colors: SKY_BLUE,
      disableForReducedMotion: true,
      particleCount: Math.floor(220 * particleRatio),
      ...opts,
    })
  }

  wings(0.28, { spread: 26, startVelocity: 58, origin: { y: 0.7 } })
  wings(0.22, { spread: 60, origin: { y: 0.7 } })
  wings(0.38, { spread: 100, decay: 0.91, scalar: 0.9, origin: { y: 0.7 } })
  wings(0.12, { spread: 120, startVelocity: 26, decay: 0.92, scalar: 1.25, origin: { y: 0.7 } })
  wings(0.12, { spread: 120, startVelocity: 46, origin: { y: 0.7 } })

  // Then a lingering side-drift for a couple of seconds.
  const drift = () => {
    if (Date.now() > end) return
    void confetti({
      colors: SKY_BLUE,
      disableForReducedMotion: true,
      particleCount: 3,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.65 },
    })
    void confetti({
      colors: SKY_BLUE,
      disableForReducedMotion: true,
      particleCount: 3,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.65 },
    })
    requestAnimationFrame(drift)
  }
  drift()
}

/** Smaller pop used when the candles go out. */
export function wishBurst() {
  void confetti({
    colors: SKY_BLUE,
    disableForReducedMotion: true,
    particleCount: 90,
    spread: 78,
    startVelocity: 42,
    scalar: 0.95,
    origin: { y: 0.62 },
  })
}

/** Best-effort haptics. Silently absent on iOS Safari, which has no API. */
export function buzz(pattern: number | number[] = [100, 50, 100]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* unsupported */
  }
}
