import { AnimatePresence, motion } from 'framer-motion'
import { KeyRound, Lock, ShieldCheck, Signal } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { COPY, PREVIEW_KEY } from '../config'
import { buzz } from '../lib/celebrate'

const HOLD_MS = 1200

/**
 * The status chip on the lock screen — and your way in behind it.
 *
 * Press and hold it for 1.2s and a key prompt slides out; the right key drops
 * you into the unlocked experience early. Nothing about the chip hints that it
 * is pressable, and a stray long-press only reveals an input that does nothing
 * without the key, so she cannot stumble into the surprise.
 */
export function SecretAccess({
  verified,
  onGranted,
}: {
  verified: boolean
  onGranted: () => void
}) {
  const [prompting, setPrompting] = useState(false)
  const [value, setValue] = useState('')
  const [denied, setDenied] = useState(false)
  const [held, setHeld] = useState(false)
  const timerRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const cancelHold = useCallback(() => {
    window.clearTimeout(timerRef.current)
    setHeld(false)
  }, [])

  const beginHold = useCallback(() => {
    setHeld(true)
    timerRef.current = window.setTimeout(() => {
      setHeld(false)
      setPrompting(true)
      buzz(30)
    }, HOLD_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  // Autofocus once the panel is actually on screen.
  useEffect(() => {
    if (prompting) window.setTimeout(() => inputRef.current?.focus(), 240)
  }, [prompting])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim().toLowerCase() === PREVIEW_KEY.trim().toLowerCase()) {
      buzz([40, 30, 90])
      setPrompting(false)
      setValue('')
      onGranted()
    } else {
      setDenied(true)
      buzz(200)
      window.setTimeout(() => setDenied(false), 700)
    }
  }

  return (
    <div className="mb-8 flex flex-col items-center">
      <motion.div
        animate={{ scale: held ? 0.95 : 1 }}
        transition={{ duration: HOLD_MS / 1000, ease: 'linear' }}
        onPointerDown={beginHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
        className="glass flex cursor-default items-center gap-2.5 rounded-full py-2 pr-4 pl-3 select-none"
        style={{ WebkitTouchCallout: 'none' }}
      >
        <Lock size={12} className="text-rose" />
        <span className="font-display text-[12px] tracking-[0.14em] text-white/60 lowercase">
          {COPY.lockedChip}
        </span>
        <span className="h-3 w-px bg-white/15" />
        <span
          className="flex items-center gap-1 font-display text-[11px] tracking-[0.1em] text-white/35 lowercase"
          title={verified ? 'Countdown checked against server time' : 'Using this device clock'}
        >
          {verified ? <ShieldCheck size={11} /> : <Signal size={11} />}
          {verified ? COPY.clockChecked : COPY.clockLocal}
        </span>
      </motion.div>

      <AnimatePresence>
        {prompting && (
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <motion.div
              animate={denied ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className={`glass mt-3 flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-3.5 ${
                denied ? 'border-crimson/60' : ''
              }`}
            >
              <KeyRound size={12} className={denied ? 'text-crimson' : 'text-white/40'} />
              <input
                ref={inputRef}
                type="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={denied ? 'denied' : 'key'}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Preview key"
                className="w-28 bg-transparent font-mono text-[11px] tracking-[0.2em] text-white placeholder:text-white/25 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[9px] tracking-[0.2em] text-white/60 uppercase transition-colors hover:text-white"
              >
                enter
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrompting(false)
                  setValue('')
                }}
                aria-label="Cancel"
                className="px-2 font-mono text-[9px] tracking-[0.2em] text-white/25 uppercase"
              >
                esc
              </button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
