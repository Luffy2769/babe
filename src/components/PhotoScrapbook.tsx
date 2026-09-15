import { motion } from 'framer-motion'
import { Heart, MapPin, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { buzz } from '../lib/celebrate'
import { playClick, playSparkle } from '../lib/sfx'
import { SectionHeading } from './ui/SectionHeading'

interface PolaroidItem {
  id: string
  title: string
  date: string
  location: string
  frontCaption: string
  backNote: string
  imageSrc?: string
  gradient: string
  rotation: number
}

const SCRAPBOOK_PHOTOS: PolaroidItem[] = [
  {
    id: 'p1',
    title: 'The Knife Doodle',
    date: 'Our Daily Dynamic',
    location: 'Accurate Representation',
    frontCaption: '"AA" 😭🔪',
    backNote:
      'You threatening me with a knife while I tremble in fear in the corner. Honestly the most accurate artistic depiction of our relationship. I love this drawing so much.',
    imageSrc: '/images/memories/01.jpg',
    gradient: 'from-sky-500/40 via-sky-700/30 to-indigo-950/60',
    rotation: -2.5,
  },
  {
    id: 'p2',
    title: 'Minecraft Cherry Blossom Date',
    date: 'Pos: 8, 111, 117',
    location: 'LuciaNana2609 & Me',
    frontCaption: 'Standing by our giant heart.',
    backNote:
      'Our Minecraft avatars standing together in front of the giant red heart surrounded by cherry blossom trees and red roses. The best virtual date ever.',
    imageSrc: '/images/memories/02.jpg',
    gradient: 'from-cyan-500/35 via-sky-600/30 to-black/70',
    rotation: 2.8,
  },
  {
    id: 'p3',
    title: 'My Princess (Nurul)',
    date: 'Written in Pink Ink',
    location: 'On Real Paper',
    frontCaption: '"I LOVE MY PRINCESS ❤️"',
    backNote:
      '"I LOVE MY PRINCESS (NURUL) ❤️" — Written down on real paper with hearts because some things deserve to be written by hand. You are my princess, always and forever.',
    imageSrc: '/images/memories/03.jpg',
    gradient: 'from-blue-600/35 via-sky-800/30 to-black/70',
    rotation: -1.8,
  },
  {
    id: 'p4',
    title: 'Our Roblox Wedding',
    date: 'Officially Paired',
    location: 'Paired with Luffy',
    frontCaption: 'Luffy & the prettiest bride.',
    backNote:
      'Luffy in a tuxedo paired with you in a wedding dress and veil. Who needs a real church when we can get married on Roblox with piggyback privileges?',
    imageSrc: '/images/memories/04.jpg',
    gradient: 'from-sky-400/35 via-indigo-600/30 to-charcoal',
    rotation: 2.2,
  },
]

export function PhotoScrapbook() {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})

  const handleFlip = (id: string) => {
    buzz(15)
    setFlipped((prev) => {
      const nextState = !prev[id]
      if (nextState) {
        playSparkle()
      } else {
        playClick()
      }
      return { ...prev, [id]: nextState }
    })
  }

  return (
    <section className="relative mx-auto w-full max-w-lg px-5 py-14">
      <SectionHeading
        index="07"
        eyebrow="evidence & keepsakes"
        title="The Memory Scrapbook."
        sub="Polaroids from our chapter so far. Tap any photo to flip it over and read what I wrote on the back."
      />

      <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2">
        {SCRAPBOOK_PHOTOS.map((item) => {
          const isFlipped = flipped[item.id]

          return (
            <div
              key={item.id}
              onClick={() => handleFlip(item.id)}
              className="group relative cursor-pointer select-none perspective-[1000px]"
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0, rotateZ: item.rotation }}
                whileHover={{ scale: 1.03, rotateZ: 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                className="relative h-[320px] w-full rounded-2xl bg-white p-3.5 shadow-2xl transition-all duration-300 transform-style-3d"
              >
                {/* Vintage Washi Tape Strip */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 h-6 w-20 -rotate-2 rounded-sm bg-rose/40 backdrop-blur-sm border-t border-b border-white/40 shadow-sm" />

                {/* FRONT OF POLAROID */}
                <div
                  className={`absolute inset-3.5 flex flex-col justify-between backface-hidden ${
                    isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
                  }`}
                >
                  {/* Photo Canvas */}
                  <div
                    className={`relative h-[220px] w-full overflow-hidden rounded-lg bg-gradient-to-br ${item.gradient} p-4 flex flex-col justify-between`}
                  >
                    {item.imageSrc ? (
                      <>
                        <img
                          src={item.imageSrc}
                          alt={item.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />
                        <div className="relative z-10 flex justify-between items-start">
                          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white/90 backdrop-blur-sm">
                            {item.date}
                          </span>
                          <Heart size={16} className="text-sky-300 fill-sky-300" />
                        </div>
                        <div className="relative z-10 text-left">
                          <p className="font-display text-[14px] font-semibold text-white drop-shadow-md">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-white/80 mt-0.5">
                            <MapPin size={10} />
                            <span>{item.location}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-mono text-white/90 backdrop-blur-sm">
                            {item.date}
                          </span>
                          <Heart size={16} className="text-rose fill-rose" />
                        </div>

                        <div className="text-center">
                          <Sparkles size={24} className="mx-auto mb-2 text-white/80 animate-pulse" />
                          <p className="font-display text-[15px] font-semibold text-white drop-shadow-md">
                            {item.title}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-white/70">
                          <MapPin size={10} />
                          <span>{item.location}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Polaroid Bottom Margin Note */}
                  <div className="pt-2 text-center">
                    <p className="font-display text-[12.5px] font-medium text-neutral-800">
                      {item.frontCaption}
                    </p>
                    <p className="text-[9.5px] text-neutral-400 mt-0.5">tap to flip ↺</p>
                  </div>
                </div>

                {/* BACK OF POLAROID */}
                <div
                  className={`absolute inset-3.5 flex flex-col justify-between rounded-lg bg-stone-100 p-5 text-neutral-800 rotate-y-180 backface-hidden ${
                    isFlipped ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-300 pb-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                        {item.date}
                      </span>
                      <span className="text-[10px] text-rose font-semibold">CONFIDENTIAL</span>
                    </div>

                    <p className="mt-4 font-display text-[13.5px] leading-relaxed text-neutral-800 italic">
                      "{item.backNote}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-200 pt-2 text-[10.5px] text-neutral-500">
                    <span>— Yours, from Andheri</span>
                    <Heart size={12} className="text-rose fill-rose" />
                  </div>
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
