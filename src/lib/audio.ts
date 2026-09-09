/**
 * A single shared audio engine for the whole app.
 *
 * Browsers only let us create ONE MediaElementAudioSourceNode per <audio>
 * element, and only let us start an AudioContext from inside a real user
 * gesture — so both live here as module-level singletons, created lazily by
 * `unlock()` when the visitor taps [ Initialize Signal ].
 *
 * Graph:  <audio> ──▶ MediaElementSource ──▶ Analyser ──▶ Gain ──▶ destination
 *                                              │
 *                          (the visualiser reads frequency data from here)
 */

export type AudioEngineState = {
  ready: boolean
  playing: boolean
  muted: boolean
  /** true when the track file itself failed to load — the app keeps working */
  failed: boolean
}

let ctx: AudioContext | null = null
let el: HTMLAudioElement | null = null
let sourceNode: MediaElementAudioSourceNode | null = null
let analyser: AnalyserNode | null = null
let gain: GainNode | null = null
let baseVolume = 0.85

export function getContext(): AudioContext | null {
  return ctx
}

export function getAnalyser(): AnalyserNode | null {
  return analyser
}

export function getElement(): HTMLAudioElement | null {
  return el
}

/**
 * Builds the graph. MUST be called from a user-gesture handler (the splash
 * button) or Safari will hand back a suspended context that never starts.
 */
export async function unlock(src: string): Promise<{ ok: boolean; failed: boolean }> {
  if (!el) {
    el = new Audio(src)
    el.loop = true
    el.preload = 'auto'
    el.crossOrigin = 'anonymous'
    el.volume = 1 // real level is controlled by the GainNode below
  }

  // AudioContext is best-effort: if it is unavailable we still play the
  // element directly, we just lose the spectrum visualiser.
  if (!ctx) {
    try {
      const Ctor: typeof AudioContext =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new Ctor()
      sourceNode = ctx.createMediaElementSource(el)
      analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.82
      gain = ctx.createGain()
      gain.gain.value = baseVolume
      sourceNode.connect(analyser)
      analyser.connect(gain)
      gain.connect(ctx.destination)
    } catch {
      ctx = null
      analyser = null
      gain = null
      el.volume = baseVolume
    }
  }

  if (ctx?.state === 'suspended') {
    try {
      await ctx.resume()
    } catch {
      /* ignore — some browsers resume on the first play() instead */
    }
  }

  try {
    await el.play()
    return { ok: true, failed: false }
  } catch {
    // Missing file, unsupported codec, or a policy we could not satisfy.
    // The experience must continue regardless — it is just quieter.
    return { ok: false, failed: true }
  }
}

export async function play(): Promise<boolean> {
  if (!el) return false
  if (ctx?.state === 'suspended') await ctx.resume().catch(() => {})
  try {
    await el.play()
    return true
  } catch {
    return false
  }
}

export function pause() {
  el?.pause()
}

export function isPlaying(): boolean {
  return !!el && !el.paused && !el.ended
}

export function setMuted(muted: boolean) {
  if (el) el.muted = muted
}

/** Smoothly ramps the master gain — used to duck the music under the mic. */
export function rampVolume(target: number, seconds = 0.6) {
  const t = Math.max(0, Math.min(1, target))
  if (gain && ctx) {
    const now = ctx.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(t, now + seconds)
  } else if (el) {
    el.volume = t
  }
}

export function duck(seconds = 0.4) {
  rampVolume(baseVolume * 0.22, seconds)
}

export function unduck(seconds = 0.9) {
  rampVolume(baseVolume, seconds)
}

export function setBaseVolume(v: number) {
  baseVolume = Math.max(0, Math.min(1, v))
  rampVolume(baseVolume, 0.15)
}

export function currentTime(): number {
  return el?.currentTime ?? 0
}

/** Frequency snapshot for the visualiser. Returns null when unavailable. */
export function readSpectrum(target: Uint8Array<ArrayBuffer>): Uint8Array | null {
  if (!analyser) return null
  analyser.getByteFrequencyData(target)
  return target
}

/** Number of frequency bins the analyser exposes (0 when unavailable). */
export function binCount(): number {
  return analyser?.frequencyBinCount ?? 0
}
