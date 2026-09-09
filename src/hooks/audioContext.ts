import { createContext, useContext } from 'react'

export type AudioApi = {
  /** true once the visitor has tapped [ Initialize Signal ] */
  started: boolean
  playing: boolean
  muted: boolean
  /** the track could not be loaded (missing file / codec) — the app still runs */
  failed: boolean
  start: () => Promise<void>
  toggle: () => void
  toggleMute: () => void
  /** reference-counted: pull the music down (mic open, voice note playing) */
  duck: () => void
  unduck: () => void
}

export const AudioCtx = createContext<AudioApi | null>(null)

export function useAudio(): AudioApi {
  const v = useContext(AudioCtx)
  if (!v) throw new Error('useAudio must be used inside <AudioProvider>')
  return v
}
