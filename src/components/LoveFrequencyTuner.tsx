import { motion } from 'framer-motion'
import { Heart, Radio, Sparkles, Volume2, Waves } from 'lucide-react'
import { useState } from 'react'
import { buzz } from '../lib/celebrate'
import { playHeartbeat, playSparkle, playTunerBlip } from '../lib/sfx'
import { SectionHeading } from './ui/SectionHeading'

interface Channel {
  id: string
  freq: string
  name: string
  description: string
  icon: typeof Radio
  color: string
}

const CHANNELS: Channel[] = [
  {
    id: 'cosmic',
    freq: '1420.4 MHz',
    name: 'Cosmic Carrier Wave',
    description: 'The hydrogen line. 5,000 km link through clear night skies.',
    icon: Radio,
    color: '#ff1a1a',
  },
  {
    id: 'heartbeat',
    freq: '5000.0 kHz',
    name: 'Synchronized Heartbeat',
    description: 'Dual pulse locking Mumbai & Kalimantan onto one rhythm.',
    icon: Heart,
    color: '#ff2d55',
  },
  {
    id: 'ocean',
    freq: '88.50 MHz',
    name: 'Equatorial Ocean Breeze',
    description: 'Warm tropical trade winds drifting over the Indian Ocean.',
    icon: Waves,
    color: '#00f0ff',
  },
  {
    id: 'birthday',
    freq: '1609.0 MHz',
    name: '16.09 Special Broadcast',
    description: 'A frequency reserved exclusively for you. All day, forever.',
    icon: Sparkles,
    color: '#ffc93c',
  },
]

export function LoveFrequencyTuner() {
  const [activeChannel, setActiveChannel] = useState<string>('birthday')

  const selectChannel = (id: string) => {
    setActiveChannel(id)
    buzz(15)

    if (id === 'heartbeat') {
      playHeartbeat()
    } else if (id === 'birthday') {
      playSparkle()
    } else if (id === 'cosmic') {
      playTunerBlip(880)
    } else {
      playTunerBlip(440)
    }
  }

  const current = CHANNELS.find((c) => c.id === activeChannel) || CHANNELS[0]

  return (
    <section className="mx-auto w-full max-w-lg px-5 py-14">
      <SectionHeading
        index="03"
        eyebrow="something silly"
        title="Frequencies of us."
        sub="A station that only plays for you. Tap the channels."
      />

      <div className="glass relative overflow-hidden rounded-2xl p-5 sm:p-6 border-white/10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson/50 to-transparent" />

        {/* Top Radio HUD Readout */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Radio size={16} className="animate-pulse text-crimson" />
            <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-white uppercase">
              our station
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: current.color }} />
            <span className="font-mono text-[10px] tracking-widest uppercase text-white/50">
              on air
            </span>
          </div>
        </div>

        {/* Frequency Dial Display */}
        <div className="my-5 rounded-xl border border-white/10 bg-black/40 p-4 text-center">
          <p className="hud-label text-[10px] text-white/40 mb-1">tuned to</p>
          <motion.p
            key={current.freq}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-3xl font-bold tracking-[0.15em]"
            style={{ color: current.color, textShadow: `0 0 20px ${current.color}80` }}
          >
            {current.freq}
          </motion.p>
          <motion.p
            key={current.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 font-display text-sm text-white/80"
          >
            {current.name}
          </motion.p>
          <motion.p
            key={current.description}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 text-[11px] text-white/45"
          >
            {current.description}
          </motion.p>
        </div>

        {/* Channel Selector Pills */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CHANNELS.map((ch) => {
            const isSelected = ch.id === activeChannel
            const Icon = ch.icon
            return (
              <button
                key={ch.id}
                onClick={() => selectChannel(ch.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl p-3 border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-crimson bg-crimson/15 shadow-[0_0_15px_rgba(255,26,26,0.25)]'
                    : 'border-white/10 bg-white/5 text-white/50 hover:border-white/25 hover:text-white'
                }`}
              >
                <Icon size={16} style={{ color: isSelected ? ch.color : 'inherit' }} />
                <span className="font-mono text-[9px] font-bold tracking-wider uppercase">
                  {ch.freq.split(' ')[0]}
                </span>
                <span className="text-[10px] text-white/60 truncate max-w-full">
                  {ch.id}
                </span>
              </button>
            )
          })}
        </div>

        {/* Ambient Signal Bar Meter */}
        <div className="mt-5 flex items-center justify-between gap-1 border-t border-white/10 pt-4">
          <div className="flex items-center gap-1">
            <Volume2 size={12} className="text-white/30" />
            <span className="font-mono text-[9px] tracking-wider text-white/30 uppercase">
              signal strength
            </span>
          </div>
          <div className="flex items-center gap-1" aria-hidden>
            {Array.from({ length: 16 }).map((_, i) => (
              <motion.span
                key={i}
                animate={{
                  height: [4, 6 + ((i * 7) % 12), 4],
                  opacity: [0.3, 0.9, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8 + (i % 4) * 0.2,
                  delay: i * 0.05,
                }}
                className="w-1 rounded-full bg-crimson"
                style={{ height: 6 }}
              />
            ))}
          </div>
          <span className="font-mono text-[9px] tracking-wider text-emerald-400">100%</span>
        </div>
      </div>
    </section>
  )
}
