import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: string
  eyebrow?: string
  children: ReactNode
}) {
  // Lock the page behind the sheet, and let Escape close it on desktop.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="glass-strong relative z-10 flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-3xl sm:max-w-lg sm:rounded-3xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson/60 to-transparent" />

            <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 sm:px-7 sm:pt-6">
              <div className="min-w-0">
                {eyebrow && <p className="hud-label mb-1.5 text-crimson/70">{eyebrow}</p>}
                {title && (
                  <h2 className="font-display text-xl leading-tight font-medium text-white sm:text-2xl">
                    {title}
                  </h2>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="-mt-1 -mr-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-colors hover:text-white"
              >
                <X size={17} />
              </button>
            </header>

            <div className="no-scrollbar overflow-y-auto overscroll-contain px-5 pb-6 sm:px-7 sm:pb-7">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
