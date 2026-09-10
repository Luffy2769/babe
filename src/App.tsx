import { useEffect, useMemo, useState } from 'react'
import { AudioPlayer } from './components/AudioPlayer'
import { PreviewBadge } from './components/PreviewBadge'
import { BootGate } from './components/BootGate'
import { TimeLockGate } from './components/TimeLockGate'
import { UnlockedExperience } from './components/UnlockedExperience'
import { ParticlesLayer } from './components/ParticlesLayer'
import { CursorGlow } from './components/ui/CursorGlow'
import { AudioProvider } from './hooks/useAudioEngine'
import { midnightBurst, wishBurst } from './lib/celebrate'
import { now, readPreview, syncClock } from './lib/time'

function Experience() {
  const flags = useMemo(() => readPreview(), [])
  const [booted, setBooted] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  // Your early look via the secret key. Kept in sessionStorage so a refresh
  // while you're testing doesn't lock you back out, but it evaporates when the
  // tab closes — it can't leak onto her copy of the page.
  const [preview, setPreview] = useState(() => {
    try {
      return window.sessionStorage.getItem('bp.preview') === '1'
    } catch {
      return false
    }
  })
  // Waits for the clock check before deciding, so a skewed device clock can't
  // flash the unlocked view for a frame and then yank it back.
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    void syncClock().then(() => {
      if (cancelled) return
      if (flags.force === 'unlocked') setUnlocked(true)
      else if (flags.force === 'locked') setUnlocked(false)
      else setUnlocked(now() >= flags.targetTs)
      setChecked(true)
    })
    return () => {
      cancelled = true
    }
  }, [flags])

  // Arriving after midnight still deserves a welcome — but the full fullscreen
  // burst is a once-in-a-lifetime thing. Later visits get a modest pop so the
  // hero isn't buried in confetti every time she opens the link.
  useEffect(() => {
    if (!booted || !unlocked) return

    // A preview must never spend her "first visit" — it fires the small pop and
    // deliberately does not touch bp.welcomed, so the full-screen burst is
    // still waiting for her on the 16th.
    if (preview) {
      const id = window.setTimeout(wishBurst, 600)
      return () => window.clearTimeout(id)
    }

    let seen = false
    try {
      seen = window.localStorage.getItem('bp.welcomed') === '1'
      window.localStorage.setItem('bp.welcomed', '1')
    } catch {
      /* storage blocked — treat every visit as the first */
    }
    const id = window.setTimeout(seen ? wishBurst : midnightBurst, seen ? 600 : 400)
    return () => window.clearTimeout(id)
  }, [booted, unlocked, preview])

  const enterPreview = () => {
    try {
      window.sessionStorage.setItem('bp.preview', '1')
    } catch {
      /* storage blocked — preview still works for this render */
    }
    setPreview(true)
    setUnlocked(true)
  }

  const exitPreview = () => {
    try {
      window.sessionStorage.removeItem('bp.preview')
    } catch {
      /* no-op */
    }
    setPreview(false)
    setUnlocked(false)
  }

  return (
    <div className="film-grain relative min-h-[100dvh]">
      <CursorGlow />
      <ParticlesLayer />
      <AudioPlayer />

      {!booted && <BootGate onDone={() => setBooted(true)} />}

      {checked &&
        (unlocked ? (
          <UnlockedExperience />
        ) : (
          <TimeLockGate
            targetTs={flags.targetTs}
            onUnlock={() => setUnlocked(true)}
            onPreview={enterPreview}
          />
        ))}

      {preview && unlocked && <PreviewBadge onExit={exitPreview} />}
    </div>
  )
}

export default function App() {
  return (
    <AudioProvider>
      <Experience />
    </AudioProvider>
  )
}
