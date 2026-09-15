import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { PEOPLE, PULL_QUOTES } from '../config'
import { ConstellationStargazer } from './ConstellationStargazer'
import { CoupleLoreQuiz } from './CoupleLoreQuiz'
import { EmergencyLoveCapsules } from './EmergencyLoveCapsules'
import { InteractiveCake } from './InteractiveCake'
import { LoveCouponBook } from './LoveCouponBook'
import { LoveFrequencyTuner } from './LoveFrequencyTuner'
import { MatchingPfpShowcase } from './MatchingPfpShowcase'
import { OpenWhenVault } from './OpenWhenVault'
import { OpeningNote } from './OpeningNote'
import { PhotoScrapbook } from './PhotoScrapbook'
import { PhotoStrip } from './PhotoStrip'
import { PullQuote } from './PullQuote'
import { RedWaveCanvas } from './RedWaveCanvas'
import { SignalMap } from './SignalMap'
import { VirtualHugTransmitter } from './VirtualHugTransmitter'
import { VisualizerHero } from './VisualizerHero'

export function UnlockedExperience() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
      className="relative"
    >
      {/* Subtle sky blue wave canvas sitting behind content */}
      <RedWaveCanvas heightRatio={0.3} density={0.8} className="opacity-60" />

      <div className="relative z-10">
        {/* 1. Hero Audio Visualizer */}
        <VisualizerHero />

        {/* 2. Opening Note from the heart */}
        <OpeningNote />

        {/* 3. 5,000 km Signal Map between Mumbai & Sampit */}
        <SignalMap />

        <PullQuote>{PULL_QUOTES[0]}</PullQuote>

        {/* 4. Our Real Matching PFPs Across Instagram, Telegram, WhatsApp & Discord */}
        <MatchingPfpShowcase />

        {/* 5. Memories: Film Strip + 3D Flip Polaroid Keepsakes */}
        <PhotoStrip />
        <PhotoScrapbook />

        {/* 5. Long Distance Touch & Heartbeat Transmitter */}
        <VirtualHugTransmitter />

        {/* 6. Emergency Love Capsules Apothecary Jar */}
        <EmergencyLoveCapsules />

        {/* 7. Interactive Birthday Cake with Candle Blow & Sparkler */}
        <InteractiveCake />

        {/* 8. Interactive Scratch-off Love Coupon Book */}
        <LoveCouponBook />

        {/* 9. Analog Radio Station of Us */}
        <LoveFrequencyTuner />

        {/* 10. "The Lore of Us" Couple Quiz */}
        <CoupleLoreQuiz />

        {/* 11. Stargazer Constellation & Birthday Wish Caster */}
        <ConstellationStargazer />

        <PullQuote>{PULL_QUOTES[1]}</PullQuote>

        {/* 12. The 9 "Open When" Vault Envelopes */}
        <OpenWhenVault />

        {/* Footer */}
        <footer className="mx-auto w-full max-w-lg px-5 pt-8 pb-20 text-center">
          <div className="mx-auto mb-6 h-px w-28 bg-gradient-to-r from-transparent via-rose/50 to-transparent" />
          <p className="font-display text-[18px] leading-relaxed text-white/85">
            Happy birthday, {PEOPLE.recipient.name}.
          </p>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[13px] text-white/40">
            built with love in {PEOPLE.sender.city.toLowerCase()}
            <Heart size={12} className="text-rose" fill="currentColor" />
            for you in {PEOPLE.recipient.city.toLowerCase()}
          </p>
          <p className="mono-label mt-6 text-white/20">16 . 09 . 2026</p>
        </footer>
      </div>
    </motion.main>
  )
}
