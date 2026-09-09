import { motion } from 'framer-motion'
import { Check, Copy, Heart, Headphones, MailOpen, Ticket, Truck } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { LETTER, TREAT } from '../config'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { buzz } from '../lib/celebrate'
import { MemoryCarousel } from './MemoryCarousel'
import { VoiceNotePlayer } from './VoiceNotePlayer'
import { Modal } from './ui/Modal'
import { NeonButton } from './ui/NeonButton'
import { SectionHeading } from './ui/SectionHeading'

type CardId = 'now' | 'miss' | 'hear' | 'treat'

const CARDS: {
  id: CardId
  title: string
  hint: string
  icon: ReactNode
  eyebrow: string
}[] = [
  {
    id: 'now',
    title: 'Open Right Now',
    hint: 'A letter I have been writing in my head for weeks.',
    icon: <MailOpen size={18} />,
    eyebrow: 'the letter',
  },
  {
    id: 'miss',
    title: 'Open When You Miss Me',
    hint: 'Proof, in pictures.',
    icon: <Heart size={18} />,
    eyebrow: 'the archive',
  },
  {
    id: 'hear',
    title: 'Open When You Want to Hear Me',
    hint: 'My voice, on demand. Use headphones.',
    icon: <Headphones size={18} />,
    eyebrow: 'the recording',
  },
  {
    id: 'treat',
    title: 'Open For a Treat',
    hint: 'Redeemable. Immediately.',
    icon: <Ticket size={18} />,
    eyebrow: 'the voucher',
  },
]

/** Card 1 body. */
function LetterBody() {
  return (
    <article className="space-y-4">
      <p className="font-display text-lg text-white/90">{LETTER.greeting}</p>
      {LETTER.paragraphs.map((p, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.12, duration: 0.6 }}
          className="text-[14.5px] leading-[1.75] text-white/65"
        >
          {p}
        </motion.p>
      ))}
      <div className="pt-2">
        <p className="text-[14.5px] text-white/65">{LETTER.signoff}</p>
        <p className="neon-text mt-1 font-display text-lg">{LETTER.signature}</p>
      </div>
    </article>
  )
}

/** Card 4 body — voucher code plus a delivery timeline. */
function TreatBody() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(TREAT.code)
      setCopied(true)
      buzz(20)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard is blocked on insecure origins — the code is on screen anyway.
      setCopied(false)
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-[14.5px] leading-relaxed text-white/70">{TREAT.headline}</p>

      <div className="relative overflow-hidden rounded-2xl border border-dashed border-crimson/45 bg-crimson/8 p-5 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,26,26,0.22),transparent_65%)]" />
        <p className="hud-label relative mb-2">voucher code</p>
        <p className="neon-text relative font-mono text-2xl font-bold tracking-[0.15em]">
          {TREAT.code}
        </p>
        <button
          onClick={() => void copy()}
          className="relative mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-white/70 uppercase transition-colors hover:text-white"
        >
          {copied ? <Check size={12} className="text-crimson" /> : <Copy size={12} />}
          {copied ? 'copied' : 'copy code'}
        </button>
      </div>

      <p className="text-[13px] leading-relaxed text-white/50">{TREAT.description}</p>

      <div>
        <p className="hud-label mb-3 flex items-center gap-2">
          <Truck size={12} /> delivery status
        </p>
        <ol className="relative space-y-4 pl-6">
          <span className="absolute top-1 bottom-2 left-[5px] w-px bg-white/12" />
          {TREAT.steps.map((s, i) => (
            <motion.li
              key={s.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 * i, duration: 0.5 }}
              className="relative"
            >
              <span
                className={`absolute top-1 -left-6 h-[11px] w-[11px] rounded-full border ${
                  s.done ? 'border-crimson bg-crimson' : 'border-white/30 bg-obsidian'
                }`}
                style={s.done ? { boxShadow: '0 0 10px rgba(255,26,26,0.9)' } : undefined}
              />
              <p
                className={`text-[13px] leading-tight ${s.done ? 'text-white/85' : 'text-white/40'}`}
              >
                {s.label}
              </p>
              <p className="mt-0.5 font-mono text-[10px] tracking-wider text-white/30">
                {s.detail}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>

      <p className="border-t border-white/10 pt-3 text-center font-mono text-[9px] tracking-[0.15em] text-white/25 uppercase">
        {TREAT.fineprint}
      </p>
    </div>
  )
}

export function OpenWhenVault() {
  // Which envelopes she has already opened, remembered across visits.
  const [opened, setOpened] = useLocalStorage<Record<string, boolean>>('bp.opened', {})
  const [active, setActive] = useState<CardId | null>(null)

  const open = (id: CardId) => {
    setActive(id)
    setOpened((o) => ({ ...o, [id]: true }))
    buzz(15)
  }

  const card = CARDS.find((c) => c.id === active)

  return (
    <section className="mx-auto w-full max-w-lg px-5 py-16">
      <SectionHeading
        index="03"
        eyebrow="open when…"
        title={
          <>
            Four envelopes.
            <br />
            <span className="text-white/40">Open them whenever you need them.</span>
          </>
        }
        sub="They stay here. Come back at 3am on a bad Tuesday and they will still be waiting."
      />

      <div className="grid grid-cols-2 gap-3">
        {CARDS.map((c, i) => {
          const isOpened = !!opened[c.id]
          return (
            <motion.button
              key={c.id}
              onClick={() => open(c.id)}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.97 }}
              className="glass group relative flex min-h-[168px] flex-col justify-between overflow-hidden rounded-2xl p-4 text-left transition-colors hover:border-crimson/40"
            >
              {/* corner glow that warms on hover */}
              <span className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-crimson/20 blur-2xl transition-opacity duration-500 group-hover:bg-crimson/40" />

              <span className="relative flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-crimson">
                  {c.icon}
                </span>
                {isOpened && (
                  <span className="font-mono text-[8px] tracking-[0.2em] text-white/25 uppercase">
                    opened
                  </span>
                )}
              </span>

              <span className="relative">
                <span className="hud-label mb-1.5 block text-crimson/60">{c.eyebrow}</span>
                <span className="block text-[13.5px] leading-[1.25] font-medium text-balance text-white/90">
                  {c.title}
                </span>
                <span className="mt-1.5 block text-[11px] leading-snug text-white/35">
                  {c.hint}
                </span>
              </span>
            </motion.button>
          )
        })}
      </div>

      <Modal
        open={active !== null}
        onClose={() => setActive(null)}
        eyebrow={card?.eyebrow}
        title={card?.title}
      >
        {active === 'now' && <LetterBody />}
        {active === 'miss' && <MemoryCarousel />}
        {active === 'hear' && (
          <div className="space-y-4">
            <p className="text-[14px] leading-relaxed text-white/60">
              Press play. It is not polished and I said &ldquo;um&rdquo; a lot, and I am
              leaving it exactly like that.
            </p>
            <VoiceNotePlayer />
          </div>
        )}
        {active === 'treat' && <TreatBody />}

        <div className="mt-6">
          <NeonButton onClick={() => setActive(null)} variant="ghost" full>
            close
          </NeonButton>
        </div>
      </Modal>
    </section>
  )
}
