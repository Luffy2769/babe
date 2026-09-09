import { useCallback, useEffect, useRef, useState } from 'react'
import * as engine from '../lib/audio'

export type BlowState = 'idle' | 'requesting' | 'listening' | 'denied' | 'unsupported'

type Options = {
  onBlow: () => void
  /** Normalised RMS the input must exceed. ~0.12 ignores talking, catches breath. */
  threshold?: number
  /** How long it must stay over the line before we count it as a real blow. */
  sustainMs?: number
}

/**
 * Listens to the microphone and fires once a sustained, broadband burst of
 * energy is detected — i.e. someone actually blowing at the phone rather than
 * the room being noisy.
 *
 * Two conditions must hold together:
 *   1. RMS loudness over `threshold`
 *   2. energy concentrated in the low band (a breath is mostly turbulent LF
 *      noise; speech and music carry far more mid/high content)
 *
 * The mic analyser is never connected to the destination — that would feed the
 * phone's own speaker straight back into it.
 */
export function useBlowDetector({ onBlow, threshold = 0.12, sustainMs = 380 }: Options) {
  const [state, setState] = useState<BlowState>('idle')
  const [level, setLevel] = useState(0)

  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const ownsCtxRef = useRef(false)
  const rafRef = useRef(0)
  const heldRef = useRef(0)
  const lastTsRef = useRef(0)
  const firedRef = useRef(false)
  const onBlowRef = useRef(onBlow)

  // Keep the callback fresh without making `start` depend on its identity.
  useEffect(() => {
    onBlowRef.current = onBlow
  }, [onBlow])

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (ownsCtxRef.current) {
      void ctxRef.current?.close().catch(() => {})
      ownsCtxRef.current = false
    }
    ctxRef.current = null
    heldRef.current = 0
    setLevel(0)
    setState((s) => (s === 'listening' || s === 'requesting' ? 'idle' : s))
  }, [])

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unsupported')
      return
    }
    setState('requesting')
    firedRef.current = false

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // All three would flatten exactly the signal we are looking for.
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
    } catch {
      setState('denied')
      return
    }

    streamRef.current = stream

    // Reuse the music context when it exists so we don't burn a second one
    // (Safari caps how many an origin may hold open).
    let ctx = engine.getContext()
    if (!ctx) {
      const Ctor: typeof AudioContext =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new Ctor()
      ownsCtxRef.current = true
    }
    if (ctx.state === 'suspended') await ctx.resume().catch(() => {})
    ctxRef.current = ctx

    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 1024
    analyser.smoothingTimeConstant = 0.5
    source.connect(analyser) // deliberately NOT connected to destination

    const time = new Uint8Array(analyser.fftSize)
    const freq = new Uint8Array(analyser.frequencyBinCount)
    setState('listening')
    lastTsRef.current = performance.now()

    const tick = (ts: number) => {
      const dt = ts - lastTsRef.current
      lastTsRef.current = ts

      analyser.getByteTimeDomainData(time)
      analyser.getByteFrequencyData(freq)

      // RMS around the 128 zero-point.
      let sum = 0
      for (let i = 0; i < time.length; i++) {
        const v = (time[i] - 128) / 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / time.length)

      // Low band vs everything else. Breath skews heavily low.
      const split = Math.floor(freq.length * 0.16)
      let low = 0
      let high = 0
      for (let i = 0; i < split; i++) low += freq[i]
      for (let i = split; i < freq.length; i++) high += freq[i]
      const lowAvg = low / Math.max(1, split)
      const highAvg = high / Math.max(1, freq.length - split)
      const breathy = lowAvg > highAvg * 1.35

      setLevel(Math.min(1, rms / (threshold * 1.8)))

      if (rms > threshold && breathy) {
        heldRef.current += dt
      } else {
        // Decay rather than hard-reset, so a wobbly breath still counts.
        heldRef.current = Math.max(0, heldRef.current - dt * 1.5)
      }

      if (heldRef.current >= sustainMs && !firedRef.current) {
        firedRef.current = true
        onBlowRef.current()
        stop()
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [threshold, sustainMs, stop])

  useEffect(() => stop, [stop])

  return { state, level, start, stop }
}
