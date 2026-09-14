import { motion } from 'framer-motion'
import { OPENING_NOTE } from '../config'

/**
 * The first thing after the hero. Its whole job is to make sure the first
 * scroll lands on words rather than on a screen of empty black.
 */
export function OpeningNote() {
  return (
    <section className="relative mx-auto w-full max-w-lg px-6 pt-4 pb-16">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="hud-label mb-6 text-rose/70"
      >
        {OPENING_NOTE.eyebrow}
      </motion.p>

      {OPENING_NOTE.lines.map((line, i) => (
        <motion.p
          key={line}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: i * 0.18, ease: [0.16, 1, 0.3, 1] }}
          className={`font-display text-[26px] leading-[1.25] text-balance sm:text-[32px] ${
            i === 0 ? 'warm-text font-semibold' : 'font-light text-white/80'
          }`}
        >
          {line}
        </motion.p>
      ))}

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-7 max-w-md text-[15px] leading-[1.75] text-white/50"
      >
        {OPENING_NOTE.body}
      </motion.p>
    </section>
  )
}
