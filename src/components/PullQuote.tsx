import { motion } from 'framer-motion'

/**
 * A single large line between sections. Breaks the rhythm of
 * heading → widget → heading → widget, and keeps the scroll feeling written
 * rather than assembled.
 */
export function PullQuote({ children }: { children: string }) {
  return (
    <section className="relative mx-auto w-full max-w-lg px-6 py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <span
          aria-hidden
          className="warm-text absolute -top-5 -left-1 font-display text-[64px] leading-none opacity-40 select-none"
        >
          &ldquo;
        </span>
        <p className="serif-quote relative pl-6 text-[22px] leading-[1.5] text-balance text-white/75 sm:text-[26px]">
          {children}
        </p>
        <div className="mt-6 ml-6 h-px w-16 bg-gradient-to-r from-rose/60 to-transparent" />
      </motion.div>
    </section>
  )
}
