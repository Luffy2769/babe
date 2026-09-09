import { motion } from 'framer-motion'
import { Eye, X } from 'lucide-react'

/**
 * Only you ever see this. It exists so you can never forget you are looking at
 * the page in preview and mistake it for the real unlock — and so you can get
 * back to the lock screen to check that side too.
 */
export function PreviewBadge({ onExit }: { onExit: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed bottom-0 left-1/2 z-40 -translate-x-1/2 p-3"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="glass flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-3.5">
        <Eye size={11} className="text-crimson" />
        <span className="font-mono text-[9px] tracking-[0.22em] text-white/50 uppercase">
          preview mode
        </span>
        <button
          onClick={onExit}
          aria-label="Exit preview"
          className="grid h-7 w-7 place-items-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={12} />
        </button>
      </div>
    </motion.div>
  )
}
