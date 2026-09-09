import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AUDIO } from '../config'
import * as engine from '../lib/audio'
import { AudioCtx, type AudioApi } from './audioContext'

export function AudioProvider({ children }: { children: ReactNode }) {
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [failed, setFailed] = useState(false)
  const duckDepth = useRef(0)

  const start = useCallback(async () => {
    const res = await engine.unlock(AUDIO.track)
    setStarted(true)
    setFailed(res.failed)
    setPlaying(res.ok)
  }, [])

  const toggle = useCallback(() => {
    if (engine.isPlaying()) {
      engine.pause()
      setPlaying(false)
    } else {
      void engine.play().then((ok) => setPlaying(ok))
    }
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      engine.setMuted(!m)
      return !m
    })
  }, [])

  // Reference-counted so overlapping duckers (mic listening + a modal) can't
  // leave the music stuck at 22% forever.
  const duck = useCallback(() => {
    duckDepth.current += 1
    engine.duck()
  }, [])

  const unduck = useCallback(() => {
    duckDepth.current = Math.max(0, duckDepth.current - 1)
    if (duckDepth.current === 0) engine.unduck()
  }, [])

  // Keep React in sync with whatever the element does on its own (an
  // interrupting phone call, the iOS control-centre pause button, etc.)
  useEffect(() => {
    const el = engine.getElement()
    if (!started || !el) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('error', () => setFailed(true))
    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
    }
  }, [started])

  const value = useMemo<AudioApi>(
    () => ({ started, playing, muted, failed, start, toggle, toggleMute, duck, unduck }),
    [started, playing, muted, failed, start, toggle, toggleMute, duck, unduck],
  )

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>
}
