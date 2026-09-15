import { getContext } from './audio'

/**
 * Procedural sound effects using Web Audio API.
 * Requires zero external audio assets, works instantly, and consumes negligible memory.
 */

function getSafeContext(): AudioContext | null {
  const existing = getContext()
  if (existing && existing.state !== 'closed') {
    if (existing.state === 'suspended') {
      void existing.resume()
    }
    return existing
  }
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (Ctor) {
      return new Ctor()
    }
  } catch {
    /* AudioContext not supported or blocked */
  }
  return null
}

/** Ethereal crystal chime chord (e.g. envelope opened, wish sealed) */
export function playChime() {
  const ctx = getSafeContext()
  if (!ctx) return

  const now = ctx.currentTime
  const freqs = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now + idx * 0.05)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.05 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 1.2)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + idx * 0.05)
    osc.stop(now + idx * 0.05 + 1.3)
  })
}

/** Cybernetic sonar / radar ping for signal transmission */
export function playRadarPing() {
  const ctx = getSafeContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(1046.5, now) // C6
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.6) // drop to A4

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.12, now + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.8)
}

/** Tactile UI mechanical click */
export function playClick() {
  const ctx = getSafeContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'triangle'
  osc.frequency.setValueAtTime(180, now)
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.04)

  gain.gain.setValueAtTime(0.1, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.05)
}

/** Candle extinguish whoosh / breath */
export function playWhoosh() {
  const ctx = getSafeContext()
  if (!ctx) return

  const bufferSize = ctx.sampleRate * 0.4
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(600, ctx.currentTime)
  filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.12, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  noise.start()
  noise.stop(ctx.currentTime + 0.45)
}

/** Twinkling star / sparkler arpeggio */
export function playSparkle() {
  const ctx = getSafeContext()
  if (!ctx) return

  const now = ctx.currentTime
  const notes = [1046.5, 1318.5, 1567.98, 2093.0, 2637.0] // C6, E6, G6, C7, E7
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now + i * 0.06)

    gain.gain.setValueAtTime(0, now + i * 0.06)
    gain.gain.linearRampToValueAtTime(0.06, now + i * 0.06 + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.4)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + i * 0.06)
    osc.stop(now + i * 0.06 + 0.45)
  })
}

/** Deep resonant heartbeat double-thump */
export function playHeartbeat() {
  const ctx = getSafeContext()
  if (!ctx) return

  const playThump = (time: number, freq: number, vol: number) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, time)
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.15)

    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(vol, time + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(time)
    osc.stop(time + 0.2)
  }

  const t = ctx.currentTime
  playThump(t, 75, 0.16)
  playThump(t + 0.22, 60, 0.11)
}

/** Soft analog frequency dial click / static blip */
export function playTunerBlip(pitch = 440) {
  const ctx = getSafeContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(pitch, now)

  gain.gain.setValueAtTime(0.04, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.06)
}

/** Bubble/capsule pop sound effect */
export function playPop() {
  const ctx = getSafeContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(450, now)
  osc.frequency.exponentialRampToValueAtTime(900, now + 0.08)

  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.1)
}

/** Tactile foil scratch sound */
export function playScratch() {
  const ctx = getSafeContext()
  if (!ctx) return

  const bufferSize = ctx.sampleRate * 0.05
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.6
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 1800 + Math.random() * 1200
  filter.Q.value = 2

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.04, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  noise.start()
  noise.stop(ctx.currentTime + 0.06)
}

/** Rich harp / celestial chord */
export function playHarpChord() {
  const ctx = getSafeContext()
  if (!ctx) return

  const now = ctx.currentTime
  const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5] // C major arpeggio
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now + idx * 0.04)

    gain.gain.setValueAtTime(0, now + idx * 0.04)
    gain.gain.linearRampToValueAtTime(0.07, now + idx * 0.04 + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 1.6)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + idx * 0.04)
    osc.stop(now + idx * 0.04 + 1.7)
  })
}

let rainNode: AudioNode | null = null
let rainGain: GainNode | null = null

/** Soothing procedural night rain generator */
export function startRainAmbience(): boolean {
  const ctx = getSafeContext()
  if (!ctx) return false

  stopRainAmbience()

  // Generate pinkish / filtered noise
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.96900 * b2 + white * 0.1538520
    data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.1
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 950

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.001, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.2)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  noise.start()
  rainNode = noise
  rainGain = gain
  return true
}

export function stopRainAmbience() {
  if (rainGain && rainNode) {
    try {
      const ctx = getSafeContext()
      if (ctx) {
        rainGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.8)
        setTimeout(() => {
          try {
            ;(rainNode as AudioBufferSourceNode).stop()
          } catch {
            /* stopped */
          }
          rainNode = null
          rainGain = null
        }, 850)
        return
      }
    } catch {
      /* ignore */
    }
  }
  rainNode = null
  rainGain = null
}
