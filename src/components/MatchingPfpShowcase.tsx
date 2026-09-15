import { motion } from 'framer-motion'
import { ExternalLink, Heart, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { buzz } from '../lib/celebrate'
import { playSparkle } from '../lib/sfx'
import { SectionHeading } from './ui/SectionHeading'

interface PfpMoment {
  id: string
  platform: 'instagram' | 'telegram' | 'whatsapp' | 'discord'
  platformName: string
  badgeColor: string
  badgeBg: string
  title: string
  date: string
  imageSrc?: string
  quote: string
  lore: string
  details?: string
}

const PFP_MOMENTS: PfpMoment[] = [
  {
    id: 'instagram',
    platform: 'instagram',
    platformName: 'Instagram',
    badgeColor: '#e0f2fe',
    badgeBg: 'bg-gradient-to-r from-sky-500/30 to-indigo-600/30 border-sky-400/40',
    title: 'The First Matching PFP',
    date: '18 APR 2024',
    imageSrc: '/images/memories/pfp-instagram.png',
    quote: '"thiss??? ... LOVE YOU FIRST ... YAYYY"',
    lore: 'Where our matching lore officially began. You sent the cute anime cat duo, we set it together, and it became an immediate ritual.',
    details: '18 Apr 2024 • The Genesis of Us',
  },
  {
    id: 'telegram',
    platform: 'telegram',
    platformName: 'Telegram',
    badgeColor: '#38bdf8',
    badgeBg: 'bg-sky-500/20 border-sky-400/30',
    title: 'Dan Heng & March 7th',
    date: 'The Telegram Era',
    imageSrc: '/images/memories/pfp-telegram.jpg',
    quote: '"Uhm THEY ARE GUD YEAH ... OKAYY ... whoaaaa"',
    lore: 'Dan Heng and March 7th paired with your starry-eyed Paimon & Sparkle stickers. A legendary aesthetic choice.',
    details: 'Honkai Star Rail Matching Duo',
  },
  {
    id: 'whatsapp',
    platform: 'whatsapp',
    platformName: 'WhatsApp',
    badgeColor: '#7dd3fc',
    badgeBg: 'bg-emerald-500/20 border-emerald-400/30',
    title: '"Me Blue"',
    date: 'WhatsApp Daily Sync',
    imageSrc: '/images/memories/pfp-whatsapp.png',
    quote: '"me blue" 💙',
    lore: 'Your iconic "me blue" text when picking the webtoon matching icons, topped with the chaotic cat reaction memes at the bottom.',
    details: 'Our Main Chat • Synchronized Icons',
  },
  {
    id: 'discord',
    platform: 'discord',
    platformName: 'Discord',
    badgeColor: '#a5b4fc',
    badgeBg: 'bg-indigo-500/20 border-indigo-400/30',
    title: 'The 1-Hour PFP Debate',
    date: 'Our First Ever Match',
    quote: '"Wait what about this one? No wait that one!!"',
    lore: 'We literally couldn’t choose for like an hour ahaha since it was our very first matching pfp ever. Scrolling through dozens of icons, laughing at every option, and overthinking everything. One of my favorite memories with you.',
    details: 'Discord Origins • 60+ Mins of Debating',
  },
]

export function MatchingPfpShowcase() {
  const [selectedPhoto, setSelectedPhoto] = useState<PfpMoment | null>(null)

  const handleOpenPhoto = (pfp: PfpMoment) => {
    playSparkle()
    buzz(15)
    setSelectedPhoto(pfp)
  }

  return (
    <section className="relative mx-auto w-full max-w-lg px-5 py-14">
      <SectionHeading
        index="03"
        eyebrow="our matching lore"
        title="Matching PFPs Everywhere."
        sub="Instagram, Telegram, WhatsApp, Discord — proof that we are a team across every app."
      />

      <div className="mt-8 space-y-6">
        {PFP_MOMENTS.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: idx * 0.1, duration: 0.6 }}
            className="overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-b from-charcoal/90 via-obsidian to-black p-5 shadow-2xl backdrop-blur-md"
          >
            {/* Platform & Date Tag */}
            <div className="flex items-center justify-between">
              <span
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${item.badgeBg}`}
                style={{ color: item.badgeColor }}
              >
                <Sparkles size={11} />
                {item.platformName}
              </span>
              <span className="mono-label text-sky-200/50">{item.date}</span>
            </div>

            {/* Title & Lore */}
            <h3 className="mt-3 font-display text-[17px] font-bold text-white/95">
              {item.title}
            </h3>

            <p className="mt-1.5 font-display text-[13.5px] italic text-sky-300/85">
              {item.quote}
            </p>

            <p className="mt-2 text-[13px] leading-relaxed text-white/70">
              {item.lore}
            </p>

            {/* Screenshot or Discord Mockup Display */}
            {item.imageSrc ? (
              <div
                onClick={() => handleOpenPhoto(item)}
                className="group relative mt-4 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-inner"
              >
                <div className="relative aspect-[9/14] w-full max-h-[380px] overflow-hidden">
                  <img
                    src={item.imageSrc}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                </div>

                <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-[11px] text-sky-200 backdrop-blur-sm">
                  <span>tap to expand</span>
                  <ExternalLink size={11} />
                </div>
              </div>
            ) : (
              /* Discord Custom Lore Card */
              <div className="mt-4 rounded-2xl border border-indigo-500/30 bg-[#1e1f22]/90 p-4 shadow-inner">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 font-bold font-mono">
                    #
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-display text-[13px] font-bold text-white">#matching-pfp-council</p>
                      <span className="rounded bg-indigo-600/30 px-1.5 py-0.5 text-[9px] font-mono text-indigo-300">SERVER</span>
                    </div>
                    <p className="text-[11px] text-white/40">Duration: 1 hour 04 minutes of debating</p>
                  </div>
                </div>

                <div className="mt-3 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="h-7 w-7 shrink-0 rounded-full bg-sky-400/30 border border-sky-400/50 flex items-center justify-center text-[10px] text-sky-200">
                      N
                    </div>
                    <div className="rounded-xl bg-white/[0.04] p-2.5 text-[12.5px] text-white/80">
                      <span className="font-semibold text-sky-300 text-[11px] block mb-0.5">Nana</span>
                      "Wait what about this one?? But the second one is cute too..."
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="h-7 w-7 shrink-0 rounded-full bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center text-[10px] text-indigo-200">
                      M
                    </div>
                    <div className="rounded-xl bg-white/[0.04] p-2.5 text-[12.5px] text-white/80">
                      <span className="font-semibold text-indigo-300 text-[11px] block mb-0.5">Me</span>
                      "Whatever you pick, I'm matching it immediately haha"
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] text-white/40">
                  <span>Verdict: Perfection reached after 1 hour</span>
                  <Heart size={12} className="text-sky-400 fill-sky-400" />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Expanded Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-lg cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-sm overflow-hidden rounded-3xl border border-sky-400/40 bg-charcoal p-4 shadow-2xl"
          >
            <div className="relative aspect-[9/15] w-full overflow-hidden rounded-2xl bg-black">
              {selectedPhoto.imageSrc && (
                <img
                  src={selectedPhoto.imageSrc}
                  alt={selectedPhoto.title}
                  className="h-full w-full object-contain"
                />
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-display text-[14px] font-bold text-white">
                  {selectedPhoto.title}
                </p>
                <p className="text-[11px] text-sky-300/80">{selectedPhoto.details}</p>
              </div>

              <button
                onClick={() => setSelectedPhoto(null)}
                className="rounded-full bg-white/10 px-3.5 py-1 text-[12px] font-medium text-white hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
