import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { PEOPLE } from '../config'
import { InteractiveCake } from './InteractiveCake'
import { OpenWhenVault } from './OpenWhenVault'
import { RedWaveCanvas } from './RedWaveCanvas'
import { SignalMap } from './SignalMap'
import { VisualizerHero } from './VisualizerHero'

export function UnlockedExperience() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
      className="relative"
    >
      {/* Thinner and sparser than on the lock screen: it has to sit behind
          real content here without competing with it. */}
      <RedWaveCanvas heightRatio={0.3} density={0.8} className="opacity-60" />

      <div className="relative z-10">
        <VisualizerHero />
        <SignalMap />
        <InteractiveCake />
        <OpenWhenVault />

        <footer className="mx-auto w-full max-w-lg px-5 pt-6 pb-16 text-center">
          <div className="mx-auto mb-6 h-px w-24 bg-gradient-to-r from-transparent via-crimson/50 to-transparent" />
          <p className="flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.28em] text-white/30 uppercase">
            built from {PEOPLE.sender.city.toLowerCase()}
            <Heart size={10} className="text-crimson" fill="currentColor" />
            for {PEOPLE.recipient.city.toLowerCase()}
          </p>
          <p className="mt-3 font-mono text-[9px] tracking-[0.2em] text-white/15 uppercase">
            16 . 09 . 2026 — signal remains open
          </p>
        </footer>
      </div>
    </motion.main>
  )
}
