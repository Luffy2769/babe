import { motion, AnimatePresence } from 'framer-motion'
import { Check, Copy, Heart, Headphones, MailOpen, RotateCw, Sparkles, Ticket, Truck } from 'lucide-react'
import { useState, useEffect, type ReactNode } from 'react'
import { LETTER, TREAT } from '../config'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { buzz, wishBurst } from '../lib/celebrate'
import { playChime, playClick, playSparkle, startRainAmbience, stopRainAmbience } from '../lib/sfx'
import { MemoryCarousel } from './MemoryCarousel'
import { VoiceNotePlayer } from './VoiceNotePlayer'
import { Modal } from './ui/Modal'
import { NeonButton } from './ui/NeonButton'
import { SectionHeading } from './ui/SectionHeading'

type CardId = 'now' | 'badday' | 'sleep' | 'fight' | 'hype' | 'miss' | 'hear' | 'reasons' | 'treat'

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
    id: 'badday',
    title: 'Open On a Bad Day',
    hint: 'When everything is heavy. Breathe with me.',
    icon: <Heart size={18} />,
    eyebrow: 'grounding & comfort',
  },
  {
    id: 'sleep',
    title: "Open When You Can't Sleep",
    hint: 'At 3:00 AM under the ceiling fan. Turn on the rain.',
    icon: <Sparkles size={18} />,
    eyebrow: 'midnight lullaby',
  },
  {
    id: 'fight',
    title: 'Open When We Disagree',
    hint: 'A reminder that it is always you & me vs. the world.',
    icon: <RotateCw size={18} />,
    eyebrow: 'safe harbor',
  },
  {
    id: 'hype',
    title: 'Open When You Doubt Yourself',
    hint: 'Your personal cheerleader reminder of who you are.',
    icon: <Sparkles size={18} />,
    eyebrow: 'the hype letter',
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
    id: 'reasons',
    title: 'Open For a Reason',
    hint: '12 reasons why I love you across 5,000 km.',
    icon: <Sparkles size={18} />,
    eyebrow: 'the reasons',
  },
  {
    id: 'treat',
    title: 'Open For a Treat',
    hint: 'Redeemable. Immediately.',
    icon: <Ticket size={18} />,
    eyebrow: 'the voucher',
  },
]

const REASONS = [
  'The way you laugh at the exact moments I was worried I was being too clumsy.',
  'How even across 5,000 km of ocean, your good morning text makes yesterday disappear.',
  'You are patient with me on the days when my thoughts are loud and tangled.',
  'The tone your voice takes when you talk about something you genuinely love.',
  'Because you never ask me to apologise for the real parts of myself.',
  'The way you make ordinary Tuesdays feel like milestones worth holding onto.',
  'How you celebrate my tiny victories like they are world championships.',
  'Because you live in my future (UTC+7) and you make tomorrow feel safe.',
  'The comfort of listening to your voice notes with headphones when the world is quiet.',
  'How fiercely kind, gentle, and understanding you are to everyone in your orbit.',
  'Because no matter how chaotic the world gets, you are my anchor.',
  'Simply because you exist — and that was always more than enough.',
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

/** Open On a Bad Day — Interactive 4-7-8 Breathing & Comfort */
function BadDayBody() {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale')
  const [seconds, setSeconds] = useState(4)

  useEffect(() => {
    let timer: number
    const cycle = () => {
      setPhase('Inhale')
      setSeconds(4)
      timer = window.setTimeout(() => {
        setPhase('Hold')
        setSeconds(7)
        timer = window.setTimeout(() => {
          setPhase('Exhale')
          setSeconds(8)
          timer = window.setTimeout(cycle, 8000)
        }, 7000)
      }, 4000)
    }
    cycle()
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      {/* Interactive Calming Breathing Orb */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
        <motion.div
          animate={{
            scale: phase === 'Inhale' ? 1.35 : phase === 'Hold' ? 1.35 : 0.85,
            opacity: phase === 'Exhale' ? 0.6 : 1,
          }}
          transition={{
            duration: phase === 'Inhale' ? 4 : phase === 'Hold' ? 0.5 : 8,
            ease: 'easeInOut',
          }}
          className="flex h-28 w-28 items-center justify-center rounded-full border border-rose/50 bg-gradient-to-br from-rose/30 to-purple-600/30 shadow-[0_0_35px_rgba(255,143,163,0.3)]"
        >
          <div className="text-center">
            <p className="font-display text-sm font-semibold tracking-wide text-white">{phase}</p>
            <p className="text-[10px] text-white/60">{seconds}s • breathe with me</p>
          </div>
        </motion.div>
        <p className="mt-4 text-[12.5px] text-white/50">
          Inhale peace (4s) • Hold calmness (7s) • Release the heaviness (8s)
        </p>
      </div>

      <div className="space-y-3.5 text-[14.5px] leading-relaxed text-white/75">
        <p>
          First: put your shoulders down away from your ears, unclench your jaw, and take a sip of water.
        </p>
        <p>
          Whatever went wrong today does not define you, and it does not get to rob you of tomorrow. You are allowed to be tired. You are allowed to have bad days where the only thing you accomplish is getting through it.
        </p>
        <p>
          I am 5,000 km away right now, but you are not doing this alone. I am in your corner, always.
        </p>
        <p className="pt-2 text-rose font-display text-[15px]">
          — You're safe with me.
        </p>
      </div>
    </div>
  )
}

/** Open When You Can't Sleep — Soothing Rain Generator & Lullaby */
function CantSleepBody() {
  const [isPlayingRain, setIsPlayingRain] = useState(false)

  const toggleRain = () => {
    if (isPlayingRain) {
      stopRainAmbience()
      setIsPlayingRain(false)
    } else {
      const ok = startRainAmbience()
      if (ok) setIsPlayingRain(true)
    }
  }

  useEffect(() => {
    return () => {
      stopRainAmbience()
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Rain Audio Sound Toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose/10 text-rose">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="font-display text-[13.5px] font-semibold text-white/90">Midnight Rain Ambience</p>
            <p className="text-[11px] text-white/45">Gentle procedural rain sound</p>
          </div>
        </div>

        <button
          onClick={toggleRain}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-medium transition-all cursor-pointer ${
            isPlayingRain
              ? 'bg-rose text-black shadow-lg shadow-rose/25 font-semibold'
              : 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
          }`}
        >
          {isPlayingRain ? 'Pause Rain' : 'Play Rain 🌧️'}
        </button>
      </div>

      <div className="space-y-3.5 text-[14.5px] leading-relaxed text-white/70">
        <p>
          It is 3:00 AM, the room is quiet, and your mind is probably replaying twenty different things at once.
        </p>
        <p>
          Close your eyes. Pull the blanket up to your chin. Think about the voice notes we send each other, and how we look up at the exact same sky. Think about the day we will finally meet in person, with no screens and no time difference.
        </p>
        <p>
          Tomorrow can wait until you wake up. For right now, you are safe, you are loved, and you are mine.
        </p>
        <p className="pt-2 italic text-white/50 text-[13.5px]">
          Sweet dreams, Sayang.
        </p>
      </div>
    </div>
  )
}

/** Open When We Had a Disagreement */
function DisagreementBody() {
  return (
    <div className="space-y-4 text-[14.5px] leading-relaxed text-white/75">
      <p className="font-display text-base font-semibold text-white/95">
        Before you read anything else:
      </p>
      <p>
        I love you. Nothing we disagree on changes that. Not even for a second.
      </p>
      <p>
        Distance makes misunderstandings feel bigger than they are because we cannot see each other's faces or reach across the table to hold hands. But please remember:
      </p>
      <div className="rounded-2xl border border-rose/30 bg-rose/10 p-4 font-display text-rose text-[15px] font-medium text-center">
        It is always you & me vs. the problem. Never you vs. me.
      </div>
      <p>
        If I was clumsy with my words or made you feel unheard, I am so sorry. Take all the time and space you need, and when you are ready, I am right here waiting to listen.
      </p>
    </div>
  )
}

/** Open When You Doubt Yourself — The Hype Letter */
function HypeBody() {
  return (
    <div className="space-y-4 text-[14.5px] leading-relaxed text-white/75">
      <p className="font-display text-base font-semibold text-gold">
        A quick reminder of who you actually are:
      </p>
      <p>
        You are intelligent, deeply resilient, and remarkably capable. You have walked through days that tested you to your limit and you came out with grace every single time.
      </p>
      <p>
        Do not let imposter syndrome or a bad day convince you that you are anything less than extraordinary. You have this quiet brilliance that commands respect without ever having to shout.
      </p>
      <p>
        Walk into every room like you belong there — because you do. And if you ever forget, come back here and let me remind you.
      </p>
      <p className="pt-2 text-rose font-display text-[15px] font-medium">
        — Your biggest fan in the world.
      </p>
    </div>
  )
}

/** Card 4 body — Reasons why I love you deck. */
function ReasonsBody() {
  const [index, setIndex] = useState(0)

  const shuffle = () => {
    playSparkle()
    buzz(18)
    let next = Math.floor(Math.random() * REASONS.length)
    if (next === index) next = (next + 1) % REASONS.length
    setIndex(next)
  }

  const nextReason = () => {
    playClick()
    setIndex((prev) => (prev + 1) % REASONS.length)
  }

  const prevReason = () => {
    playClick()
    setIndex((prev) => (prev - 1 + REASONS.length) % REASONS.length)
  }

  return (
    <div className="space-y-5 text-center">
      <div className="flex items-center justify-between text-white/40 font-mono text-[10px] tracking-widest uppercase">
        <span>Reason {String(index + 1).padStart(2, '0')} / {REASONS.length}</span>
        <button
          onClick={shuffle}
          className="flex items-center gap-1.5 text-crimson hover:text-white transition-colors cursor-pointer"
        >
          <RotateCw size={11} />
          <span>Shuffle</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ duration: 0.3 }}
          className="glass relative min-h-[160px] flex flex-col justify-center items-center rounded-2xl p-6 border-crimson/30 bg-gradient-to-b from-crimson/10 to-transparent"
        >
          <Heart size={20} className="text-crimson/60 mb-3" fill="currentColor" />
          <p className="font-display text-[16px] leading-relaxed text-white/90">
            &ldquo;{REASONS[index]}&rdquo;
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={prevReason}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 font-mono text-[11px] text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer"
        >
          ← Previous
        </button>
        <button
          onClick={nextReason}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 font-mono text-[11px] text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

/** Card 5 body — voucher code plus a delivery timeline. */
function TreatBody() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(TREAT.code)
      setCopied(true)
      buzz([30, 40, 90])
      playSparkle()
      wishBurst()
      window.setTimeout(() => setCopied(false), 3000)
    } catch {
      setCopied(true)
      playSparkle()
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-[14.5px] leading-relaxed text-white/70">{TREAT.headline}</p>

      {/* Holographic metallic ticket */}
      <div className="holographic-card relative overflow-hidden rounded-2xl border border-crimson/50 p-6 text-center shadow-lg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,26,26,0.3),transparent_70%)]" />
        <p className="hud-label relative mb-2 text-gold">OFFICIAL BIRTHDAY VOUCHER</p>
        <p className="neon-text relative font-mono text-3xl font-bold tracking-[0.18em]">
          {TREAT.code}
        </p>

        {copied && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: -4 }}
            className="absolute top-3 right-3 rounded border border-emerald-400/60 bg-emerald-950/80 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-emerald-300 uppercase shadow-lg"
          >
            ✓ CLAIMED
          </motion.div>
        )}

        <button
          onClick={() => void copy()}
          className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 font-mono text-[11px] tracking-[0.2em] text-white uppercase transition-all hover:border-crimson hover:bg-crimson/20 cursor-pointer"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          {copied ? 'Code Copied!' : 'Copy Voucher Code'}
        </button>
      </div>

      <p className="text-[13px] leading-relaxed text-white/60">{TREAT.description}</p>

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
  const [opened, setOpened] = useLocalStorage<Record<string, boolean>>('bp.opened', {})
  const [active, setActive] = useState<CardId | null>(null)

  const open = (id: CardId) => {
    setActive(id)
    setOpened((o) => ({ ...o, [id]: true }))
    buzz(18)
    playChime()
  }

  const close = () => {
    playClick()
    setActive(null)
  }

  const card = CARDS.find((c) => c.id === active)

  return (
    <section className="mx-auto w-full max-w-lg px-5 py-16">
      <SectionHeading
        index="04"
        eyebrow="open when…"
        title={
          <>
            Five envelopes.
            <br />
            <span className="text-white/40">Open them whenever you need them.</span>
          </>
        }
        sub="They stay here. Come back at 3am on a bad Tuesday and they will still be waiting."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {CARDS.map((c, i) => {
          const isOpened = !!opened[c.id]
          const isWide = i === CARDS.length - 1 && CARDS.length % 2 === 1
          return (
            <motion.button
              key={c.id}
              onClick={() => open(c.id)}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.97 }}
              className={`glass group relative flex min-h-[168px] flex-col justify-between overflow-hidden rounded-2xl p-4 text-left transition-all hover:border-crimson/50 hover:bg-white/[0.07] ${
                isWide ? 'col-span-2 sm:col-span-1' : ''
              }`}
            >
              {/* corner glow */}
              <span className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-crimson/20 blur-2xl transition-opacity duration-500 group-hover:bg-crimson/45" />

              <span className="relative flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-crimson transition-transform group-hover:scale-110">
                  {c.icon}
                </span>
                {isOpened && (
                  <span className="font-mono text-[8px] tracking-[0.2em] text-emerald-400 uppercase">
                    opened ✓
                  </span>
                )}
              </span>

              <span className="relative">
                <span className="hud-label mb-1.5 block text-crimson/70">{c.eyebrow}</span>
                <span className="block text-[13.5px] leading-[1.25] font-medium text-balance text-white/90">
                  {c.title}
                </span>
                <span className="mt-1.5 block text-[11px] leading-snug text-white/40">
                  {c.hint}
                </span>
              </span>
            </motion.button>
          )
        })}
      </div>

      <Modal
        open={active !== null}
        onClose={close}
        eyebrow={card?.eyebrow}
        title={card?.title}
      >
        {active === 'now' && <LetterBody />}
        {active === 'badday' && <BadDayBody />}
        {active === 'sleep' && <CantSleepBody />}
        {active === 'fight' && <DisagreementBody />}
        {active === 'hype' && <HypeBody />}
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
        {active === 'reasons' && <ReasonsBody />}
        {active === 'treat' && <TreatBody />}

        <div className="mt-6">
          <NeonButton onClick={close} variant="ghost" full>
            close envelope
          </NeonButton>
        </div>
      </Modal>
    </section>
  )
}
