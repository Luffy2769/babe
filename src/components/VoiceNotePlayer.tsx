import { motion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AUDIO } from '../config'
import { useAudio } from '../hooks/audioContext'

const BARS = 46

/**
 * Deterministic pseudo-waveform.
 *
 * Decoding the real file would mean fetching and decoding the whole buffer on
 * a phone before anything could play; this shape is stable per-render, reads as
 * a voice envelope (quiet edges, busy middle), and costs nothing.
 */
function useWaveform() {
  return useMemo(
    () =>
      Array.from({ length: BARS }, (_, i) => {
        const seeded = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1
        const envelope = Math.sin((i / (BARS - 1)) * Math.PI) // fade in/out
        return 0.18 + seeded * 0.62 * (0.45 + envelope * 0.55)
      }),
    [],
  )
}

const fmt = (s: number) => {
  if (!Number.isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export function VoiceNotePlayer() {
  const { duck, unduck } = useAudio()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const duckedRef = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [missing, setMissing] = useState(false)
  const bars = useWaveform()

  useEffect(() => {
    const el = new Audio(AUDIO.voiceNote)
    el.preload = 'metadata'
    audioRef.current = el

    const onTime = () => {
      setCurrent(el.currentTime)
      setProgress(el.duration ? el.currentTime / el.duration : 0)
    }
    const onMeta = () => setDuration(el.duration)
    const onEnd = () => {
      setPlaying(false)
      setProgress(0)
      setCurrent(0)
      if (duckedRef.current) {
        unduck()
        duckedRef.current = false
      }
    }
    const onErr = () => setMissing(true)

    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('ended', onEnd)
    el.addEventListener('error', onErr)

    return () => {
      el.pause()
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('ended', onEnd)
      el.removeEventListener('error', onErr)
      // Never leave the soundtrack ducked because a modal closed mid-playback.
      if (duckedRef.current) {
        unduck()
        duckedRef.current = false
      }
    }
  }, [unduck])

  const toggle = async () => {
    const el = audioRef.current
    if (!el || missing) return
    if (el.paused) {
      // Pull the music down so the voice sits on top of it.
      if (!duckedRef.current) {
        duck()
        duckedRef.current = true
      }
      try {
        await el.play()
        setPlaying(true)
      } catch {
        setMissing(true)
      }
    } else {
      el.pause()
      setPlaying(false)
      if (duckedRef.current) {
        unduck()
        duckedRef.current = false
      }
    }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current
    if (!el || !el.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    el.currentTime = ratio * el.duration
    setProgress(ratio)
  }

  return (
    <div className="glass rounded-2xl p-4">
      <p className="hud-label mb-3">{AUDIO.voiceNoteTitle}</p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => void toggle()}
          disabled={missing}
          aria-label={playing ? 'Pause voice note' : 'Play voice note'}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-crimson/50 bg-crimson/15 text-white transition-colors hover:bg-crimson/25 disabled:opacity-30"
          style={{ boxShadow: '0 0 28px -8px rgba(255,26,26,0.9)' }}
        >
          {playing ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
        </button>

        <div
          className="flex h-12 flex-1 cursor-pointer items-center gap-[2px]"
          onClick={seek}
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {bars.map((h, i) => {
            const played = i / BARS <= progress
            return (
              <motion.span
                key={i}
                className={`flex-1 rounded-full ${played ? 'bg-crimson' : 'bg-white/18'}`}
                style={{
                  height: `${h * 100}%`,
                  boxShadow: played ? '0 0 6px rgba(255,26,26,0.7)' : undefined,
                }}
                animate={
                  // Only the bars near the playhead breathe, so the motion
                  // reads as "this is the part you're hearing".
                  playing && Math.abs(i / BARS - progress) < 0.06
                    ? { scaleY: [1, 1.45, 1] }
                    : { scaleY: 1 }
                }
                transition={{ duration: 0.42, repeat: playing ? Infinity : 0 }}
              />
            )
          })}
        </div>
      </div>

      <div className="mt-3 flex justify-between font-mono text-[10px] tracking-widest text-white/30">
        <span>{fmt(current)}</span>
        <span>{missing ? 'no recording yet' : fmt(duration)}</span>
      </div>

      {missing && (
        <p className="mt-2 text-[11px] leading-relaxed text-white/30">
          Drop your recording at <code className="text-crimson/70">public/audio/voice-note.mp3</code>{' '}
          and it will appear here.
        </p>
      )}
    </div>
  )
}
