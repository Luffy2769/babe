import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, Sparkles, X, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { buzz, wishBurst } from '../lib/celebrate'
import { playClick, playPop, playSparkle } from '../lib/sfx'
import { SectionHeading } from './ui/SectionHeading'

export type CapsuleCategory = 'adore' | 'miss' | 'comfort' | 'future' | 'silly'

export interface CapsuleNote {
  id: string
  category: CapsuleCategory
  categoryLabel: string
  color: string
  pillColor: string
  text: string
  subtext?: string
}

export const CAPSULES_DATA: CapsuleNote[] = [
  // Adore
  {
    id: 'c1',
    category: 'adore',
    categoryLabel: 'Reasons I Adore You',
    color: 'from-rose/30 to-blood/40',
    pillColor: '#ff2d55',
    text: 'The way your eyes squint into crescent moons when something genuinely cracks you up.',
    subtext: 'I have every version of your laugh mapped out in my mind.',
  },
  {
    id: 'c2',
    category: 'adore',
    categoryLabel: 'Reasons I Adore You',
    color: 'from-rose/30 to-blood/40',
    pillColor: '#ff2d55',
    text: 'You make ordinary Tuesdays feel like milestones worth remembering for years.',
  },
  {
    id: 'c3',
    category: 'adore',
    categoryLabel: 'Reasons I Adore You',
    color: 'from-rose/30 to-blood/40',
    pillColor: '#ff2d55',
    text: 'How fiercely kind you are to people who can do nothing for you. You have a heart of pure gold.',
  },
  {
    id: 'c4',
    category: 'adore',
    categoryLabel: 'Reasons I Adore You',
    color: 'from-rose/30 to-blood/40',
    pillColor: '#ff2d55',
    text: 'You are the first person I want to tell everything to — the silly, the mundane, and the big things.',
  },
  {
    id: 'c5',
    category: 'adore',
    categoryLabel: 'Reasons I Adore You',
    color: 'from-rose/30 to-blood/40',
    pillColor: '#ff2d55',
    text: 'You never once made me feel like I was too much or had to apologize for the real parts of myself.',
  },

  // Miss
  {
    id: 'c6',
    category: 'miss',
    categoryLabel: 'When You Miss Me',
    color: 'from-ember/30 to-rose/40',
    pillColor: '#ff6b3d',
    text: 'Five thousand kilometers is just geography. Not a single meter of it can touch how close you are to my heart.',
    subtext: 'Look up at the moon tonight — it’s the exact same one shining on me.',
  },
  {
    id: 'c7',
    category: 'miss',
    categoryLabel: 'When You Miss Me',
    color: 'from-ember/30 to-rose/40',
    pillColor: '#ff6b3d',
    text: 'Close your eyes for three seconds and take a slow breath. That warmth you feel? That is me holding your hand.',
  },
  {
    id: 'c8',
    category: 'miss',
    categoryLabel: 'When You Miss Me',
    color: 'from-ember/30 to-rose/40',
    pillColor: '#ff6b3d',
    text: 'Every hour apart is just an investment into the moment I finally get to wrap my arms around you without letting go.',
  },
  {
    id: 'c9',
    category: 'miss',
    categoryLabel: 'When You Miss Me',
    color: 'from-ember/30 to-rose/40',
    pillColor: '#ff6b3d',
    text: 'You text me "good morning" while I am still in yesterday (UTC+7 vs UTC+5:30), and it makes every morning feel safe.',
  },

  // Comfort / Doubt
  {
    id: 'c10',
    category: 'comfort',
    categoryLabel: 'When You Doubt Yourself',
    color: 'from-indigo-500/25 to-rose/30',
    pillColor: '#a78bfa',
    text: 'You are capable of handling everything that is stressing you out right now. Take it one breath at a time.',
    subtext: 'I believe in you so loudly, even on days when your own voice is a whisper.',
  },
  {
    id: 'c11',
    category: 'comfort',
    categoryLabel: 'When You Doubt Yourself',
    color: 'from-indigo-500/25 to-rose/30',
    pillColor: '#a78bfa',
    text: 'You do not have to be productive or impressive every single second. Just existing and resting is more than enough.',
  },
  {
    id: 'c12',
    category: 'comfort',
    categoryLabel: 'When You Doubt Yourself',
    color: 'from-indigo-500/25 to-rose/30',
    pillColor: '#a78bfa',
    text: 'Remember how many obstacles you have already survived that once felt impossible? You are stronger than you think.',
  },
  {
    id: 'c13',
    category: 'comfort',
    categoryLabel: 'When You Doubt Yourself',
    color: 'from-indigo-500/25 to-rose/30',
    pillColor: '#a78bfa',
    text: 'If you feel overwhelmed today: drink a glass of cold water, put your phone down, and remember that I am on your team forever.',
  },

  // Future Promises
  {
    id: 'c14',
    category: 'future',
    categoryLabel: 'Future Promises',
    color: 'from-gold/25 to-ember/30',
    pillColor: '#ffc93c',
    text: 'I promise we will watch a golden sunrise together with zero screens and zero flights between us.',
  },
  {
    id: 'c15',
    category: 'future',
    categoryLabel: 'Future Promises',
    color: 'from-gold/25 to-ember/30',
    pillColor: '#ffc93c',
    text: 'I promise to cook for you even if I burn the garlic bread, and I will always make sure you get the first bite of dessert.',
  },
  {
    id: 'c16',
    category: 'future',
    categoryLabel: 'Future Promises',
    color: 'from-gold/25 to-ember/30',
    pillColor: '#ffc93c',
    text: 'I promise to never get tired of hearing you rant about things you love or complain about things that annoyed you.',
  },
  {
    id: 'c17',
    category: 'future',
    categoryLabel: 'Future Promises',
    color: 'from-gold/25 to-ember/30',
    pillColor: '#ffc93c',
    text: 'One day our flights will have no return tickets.',
  },

  // Silly Quirks
  {
    id: 'c18',
    category: 'silly',
    categoryLabel: 'Silly Lore',
    color: 'from-emerald-500/20 to-rose/30',
    pillColor: '#34d399',
    text: 'You laughing at your own joke before you even finish saying the punchline is the cutest thing on this planet.',
  },
  {
    id: 'c19',
    category: 'silly',
    categoryLabel: 'Silly Lore',
    color: 'from-emerald-500/20 to-rose/30',
    pillColor: '#34d399',
    text: 'The 2:00 AM brainrot videos you send without any context that somehow make total sense to me.',
  },
  {
    id: 'c20',
    category: 'silly',
    categoryLabel: 'Silly Lore',
    color: 'from-emerald-500/20 to-sky-400/30',
    pillColor: '#38bdf8',
    text: 'Your sleepy voice notes when you are half-asleep and whisper goodnight. The sweetest thing ever.',
  },
  {
    id: 'c21',
    category: 'silly',
    categoryLabel: 'Silly Lore',
    color: 'from-emerald-500/20 to-sky-400/30',
    pillColor: '#00f0ff',
    text: 'You saying "me blue" whenever we match pfps. Instagram, Telegram, WhatsApp, Discord — always a team.',
  },
  {
    id: 'c22',
    category: 'silly',
    categoryLabel: 'Silly Lore',
    color: 'from-emerald-500/20 to-sky-400/30',
    pillColor: '#34d399',
    text: 'Legally, Nana is always right. In the rare case you are wrong, refer to rule #1.',
  },
]

const CATEGORIES: { id: CapsuleCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Capsules' },
  { id: 'adore', label: '💖 Adore' },
  { id: 'miss', label: '🫂 Miss Me' },
  { id: 'comfort', label: '🌿 Doubt' },
  { id: 'future', label: '✨ Future' },
  { id: 'silly', label: '🤭 Silly' },
]

export function EmergencyLoveCapsules() {
  const [selectedFilter, setSelectedFilter] = useState<CapsuleCategory | 'all'>('all')
  const [activeNote, setActiveNote] = useState<CapsuleNote | null>(null)
  const [isDispensing, setIsDispensing] = useState(false)
  const [favorites, setFavorites] = useLocalStorage<string[]>('bp.capsule_favs', [])
  const [showFavDrawer, setShowFavDrawer] = useState(false)

  const filteredPool =
    selectedFilter === 'all'
      ? CAPSULES_DATA
      : CAPSULES_DATA.filter((c) => c.category === selectedFilter)

  const dispenseCapsule = () => {
    if (isDispensing) return
    setIsDispensing(true)
    playPop()
    buzz(20)

    // Random choice excluding currently active note if possible
    const candidates =
      filteredPool.length > 1
        ? filteredPool.filter((c) => c.id !== activeNote?.id)
        : filteredPool
    const picked = candidates[Math.floor(Math.random() * candidates.length)]

    setTimeout(() => {
      setActiveNote(picked)
      setIsDispensing(false)
      playSparkle()
      wishBurst()
    }, 450)
  }

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    playClick()
    buzz(15)
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <section className="relative mx-auto w-full max-w-lg px-5 py-14">
      <SectionHeading
        index="04"
        eyebrow="prescribed with love"
        title="Emergency Love Capsules."
        sub="Whenever you miss me, feel overwhelmed, or need a smile — tap to pop open a dose."
      />

      {/* Category Pills */}
      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => {
          const isActive = selectedFilter === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => {
                playClick()
                setSelectedFilter(cat.id)
              }}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                isActive
                  ? 'bg-rose text-black shadow-lg shadow-rose/25 font-semibold'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90 border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Interactive Glowing Jar */}
      <div className="relative mt-8 flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={dispenseCapsule}
          className="relative flex h-64 w-52 cursor-pointer flex-col items-center justify-center rounded-[38px] border border-white/20 bg-gradient-to-b from-white/10 via-white/[0.04] to-rose/10 p-5 shadow-[0_0_50px_rgba(255,45,85,0.18)] backdrop-blur-md select-none"
        >
          {/* Jar Lid */}
          <div className="absolute -top-3.5 h-6 w-32 rounded-t-xl border border-white/25 bg-gradient-to-b from-stone-400/30 to-stone-800/40 shadow-inner backdrop-blur-sm" />
          <div className="absolute -top-1 h-2 w-36 rounded-full bg-white/20" />

          {/* Floating Pill Icons inside jar */}
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-3 p-4 opacity-75">
              {[
                { r: -25, c: '#ff2d55', d: 0 },
                { r: 40, c: '#ff8fa3', d: 0.2 },
                { r: 15, c: '#ffc93c', d: 0.4 },
                { r: -50, c: '#a78bfa', d: 0.1 },
                { r: 70, c: '#34d399', d: 0.3 },
                { r: -10, c: '#ff6b3d', d: 0.5 },
              ].map((pill, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [-4, 5, -4],
                    rotate: [pill.r - 5, pill.r + 5, pill.r - 5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3 + i * 0.4,
                    ease: 'easeInOut',
                    delay: pill.d,
                  }}
                  className="h-8 w-4 rounded-full border border-white/30 shadow-sm"
                  style={{
                    background: `linear-gradient(180deg, ${pill.c} 50%, #ffffff 50%)`,
                  }}
                />
              ))}
            </div>

            {/* Dispensing Animation */}
            <AnimatePresence>
              {isDispensing && (
                <motion.div
                  initial={{ scale: 0, y: 30, rotate: 0 }}
                  animate={{ scale: 1.4, y: -40, rotate: 180 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute z-20 h-11 w-5 rounded-full border border-white/60 shadow-[0_0_20px_#ff2d55]"
                  style={{
                    background: 'linear-gradient(180deg, #ff2d55 50%, #ffffff 50%)',
                  }}
                />
              )}
            </AnimatePresence>

            {/* Jar Center Label */}
            <div className="relative z-10 rounded-2xl border border-white/15 bg-black/60 px-4 py-2.5 text-center backdrop-blur-md">
              <Sparkles size={16} className="mx-auto mb-1 text-gold animate-pulse" />
              <p className="font-display text-[13px] font-semibold tracking-wide text-white/95">
                LOVE JAR
              </p>
              <p className="text-[10px] tracking-wider text-white/50 uppercase">
                {filteredPool.length} Notes Inside
              </p>
            </div>
          </div>

          {/* Glass Highlight Sheen */}
          <div className="pointer-events-none absolute inset-y-4 left-3 w-3 rounded-full bg-gradient-to-b from-white/30 via-white/10 to-transparent" />
        </motion.div>

        {/* Action Controls */}
        <div className="mt-5 flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={dispenseCapsule}
            disabled={isDispensing}
            className="flex items-center gap-2 rounded-full border border-rose/40 bg-gradient-to-r from-rose/20 to-crimson/25 px-6 py-2.5 font-display text-[14px] font-medium text-white shadow-[0_0_25px_rgba(255,45,85,0.25)] hover:border-rose transition-all cursor-pointer"
          >
            <Sparkles size={15} className="text-rose" />
            Pop a Love Capsule
          </motion.button>

          {/* Favorites Button */}
          <button
            onClick={() => {
              playClick()
              setShowFavDrawer(true)
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            title="Saved capsules"
          >
            <Bookmark size={16} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[9px] font-bold text-black">
                {favorites.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Note Modal Card */}
      <AnimatePresence>
        {activeNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur-md"
            onClick={() => setActiveNote(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/20 bg-charcoal p-7 shadow-2xl"
            >
              {/* Card Ambient Glow */}
              <div
                className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${activeNote.color} blur-3xl pointer-events-none`}
              />

              {/* Header */}
              <div className="flex items-center justify-between">
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-medium tracking-wide uppercase"
                  style={{
                    backgroundColor: `${activeNote.pillColor}22`,
                    color: activeNote.pillColor,
                    border: `1px solid ${activeNote.pillColor}44`,
                  }}
                >
                  {activeNote.categoryLabel}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleFavorite(activeNote.id, e)}
                    className="p-1.5 text-white/50 hover:text-rose transition-colors cursor-pointer"
                    title="Save to favorites"
                  >
                    {favorites.includes(activeNote.id) ? (
                      <BookmarkCheck size={20} className="text-rose" />
                    ) : (
                      <Bookmark size={20} />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveNote(null)}
                    className="p-1.5 text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Note Content */}
              <div className="my-6">
                <p className="font-display text-[17px] leading-relaxed text-white/95">
                  "{activeNote.text}"
                </p>
                {activeNote.subtext && (
                  <p className="mt-3 text-[13.5px] leading-normal text-white/60 italic">
                    — {activeNote.subtext}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <p className="text-[11px] text-white/35">Yours, always.</p>
                <button
                  onClick={dispenseCapsule}
                  className="flex items-center gap-1.5 text-[12.5px] font-medium text-rose hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} />
                  Draw another
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Favorites Drawer Modal */}
      <AnimatePresence>
        {showFavDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-5 backdrop-blur-md"
            onClick={() => setShowFavDrawer(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[80vh] w-full max-w-md overflow-hidden rounded-t-[32px] sm:rounded-[32px] border border-white/20 bg-charcoal p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <BookmarkCheck size={18} className="text-rose" />
                  <h3 className="font-display text-lg text-white/90">
                    Your Saved Notes ({favorites.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowFavDrawer(false)}
                  className="p-1 text-white/50 hover:text-white cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="no-scrollbar mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
                {favorites.length === 0 ? (
                  <p className="py-8 text-center text-[13.5px] text-white/40">
                    No notes saved yet. Tap the bookmark icon on any capsule to keep it here!
                  </p>
                ) : (
                  CAPSULES_DATA.filter((c) => favorites.includes(c.id)).map((note) => (
                    <div
                      key={note.id}
                      className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10.5px] uppercase tracking-wider text-rose/80 font-medium">
                          {note.categoryLabel}
                        </span>
                        <button
                          onClick={() => toggleFavorite(note.id)}
                          className="text-rose hover:text-white/40 transition-colors cursor-pointer"
                        >
                          <BookmarkCheck size={16} />
                        </button>
                      </div>
                      <p className="text-[13.5px] leading-relaxed text-white/85">
                        "{note.text}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
