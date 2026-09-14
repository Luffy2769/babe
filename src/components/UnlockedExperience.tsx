import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { PEOPLE, PULL_QUOTES } from '../config'
import { InteractiveCake } from './InteractiveCake'
import { OpeningNote } from './OpeningNote'
import { PhotoStrip } from './PhotoStrip'
import { PullQuote } from './PullQuote'
import { LoveFrequencyTuner } from './LoveFrequencyTuner'
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
      {/* Thinner and sparser than on the lock screen: sits behind real content */}
      <RedWaveCanvas heightRatio={0.3} density={0.8} className="opacity-60" />

      <div className="relative z-10">
        <VisualizerHero />
        {/* words immediately after the hero, so the first scroll isn't a void */}
        <OpeningNote />
        <SignalMap />
        <PullQuote>{PULL_QUOTES[0]}</PullQuote>
        <PhotoStrip />
        <InteractiveCake />
        <LoveFrequencyTuner />
        <PullQuote>{PULL_QUOTES[1]}</PullQuote>
        <OpenWhenVault />

        <footer className="mx-auto w-full max-w-lg px-5 pt-6 pb-16 text-center">
          <div className="mx-auto mb-6 h-px w-24 bg-gradient-to-r from-transparent via-crimson/50 to-transparent" />
          <p className="font-display text-[17px] leading-relaxed text-white/70">
            Happy birthday, {PEOPLE.recipient.name}.
          </p>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[13px] text-white/35">
            made in {PEOPLE.sender.city.toLowerCase()}
            <Heart size={11} className="text-rose" fill="currentColor" />
            for you in {PEOPLE.recipient.city.toLowerCase()}
          </p>
          <p className="mono-label mt-5 text-white/20">16 . 09 . 2026</p>
        </footer>
      </div>
    </motion.main>
  )
}
