import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function SectionHeading({
  index,
  eyebrow,
  title,
  sub,
}: {
  index: string
  eyebrow: string
  title: ReactNode
  sub?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="mb-6 sm:mb-8"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-[11px] font-bold text-crimson">{index}</span>
        <span className="h-px flex-1 bg-gradient-to-r from-crimson/40 to-transparent" />
        <span className="hud-label">{eyebrow}</span>
      </div>
      <h2 className="font-display text-2xl leading-[1.15] font-light text-balance text-white sm:text-3xl">
        {title}
      </h2>
      {sub && <p className="mt-2 max-w-md text-sm leading-relaxed text-white/45">{sub}</p>}
    </motion.div>
  )
}
