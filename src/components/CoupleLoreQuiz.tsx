import { AnimatePresence, motion } from 'framer-motion'
import { Award, RotateCcw, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { PEOPLE } from '../config'
import { buzz, wishBurst, midnightBurst } from '../lib/celebrate'
import { playChime, playClick, playSparkle } from '../lib/sfx'
import { SectionHeading } from './ui/SectionHeading'

interface Question {
  id: number
  prompt: string
  options: {
    label: string
    feedback: string
    isExtraCute?: boolean
  }[]
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    prompt: 'Question 1: Who fell first vs. who fell harder?',
    options: [
      {
        label: 'I fell first, but you definitely fell harder.',
        feedback: 'Accurate! I took one look at you and lost all my composure.',
      },
      {
        label: 'You fell first, and you also fell harder.',
        feedback: 'Guilty as charged. I never stood a chance.',
      },
      {
        label: 'It was simultaneous gravitational collapse.',
        feedback: 'The physics of us! The universe literally pulled us together.',
      },
      {
        label: 'We are still falling harder every single day.',
        feedback: 'Ding ding ding! Correct answer: there is no bottom to this.',
        isExtraCute: true,
      },
    ],
  },
  {
    id: 2,
    prompt: 'Question 2: What is the official distance between Mumbai and Sampit?',
    options: [
      {
        label: '5,000 km across the ocean.',
        feedback: 'Geographically true, but emotionally irrelevant!',
      },
      {
        label: '0 km because you live rent-free in my chest.',
        feedback: '100% correct! You have permanent residence here.',
        isExtraCute: true,
      },
      {
        label: 'Way too far — we need to invent teleportation.',
        feedback: 'Agreed. Currently writing to NASA to expedite the flight.',
      },
      {
        label: 'Just a temporary number until our next hug.',
        feedback: 'Exactly. Every kilometer will be erased the second we meet.',
      },
    ],
  },
  {
    id: 3,
    prompt: 'Question 3: What is my absolute favorite thing about you?',
    options: [
      {
        label: 'Your voice notes that I replay in my headphones.',
        feedback: 'One of the sweetest sounds in this entire universe.',
      },
      {
        label: 'You saying "me blue" whenever we match pfps.',
        feedback: 'Iconic. Blue is officially your color forever.',
      },
      {
        label: 'How kind, gentle, and understanding you are.',
        feedback: 'Your heart is the rarest thing I have ever known.',
      },
      {
        label: 'Trick question: absolutely every single detail.',
        feedback: 'Bingo! From your mind to your quirks, I love every bit of you.',
        isExtraCute: true,
      },
    ],
  },
  {
    id: 4,
    prompt: 'Question 4: What happens whenever you are in a grumpy mood or pout?',
    options: [
      {
        label: 'You become dangerously intimidating.',
        feedback: 'Haha! You look like an angry marshmallow, not scary at all.',
      },
      {
        label: 'You become 10x cuter and I just want to squeeze you.',
        feedback: 'Facts! The pout makes you completely irresistible.',
        isExtraCute: true,
      },
      {
        label: 'I immediately panic and send you sweet treats.',
        feedback: 'Standard emergency protocol. Works every single time.',
      },
      {
        label: 'I listen to you until everything feels soft again.',
        feedback: 'Always. Your feelings will always have a safe home with me.',
      },
    ],
  },
  {
    id: 5,
    prompt: 'Final Question: What is the plan for our future?',
    options: [
      {
        label: 'Watching endless sunsets with no airports between us.',
        feedback: 'On the calendar. No return tickets ever again.',
      },
      {
        label: 'Me cooking your favorite dinners & stealing desserts.',
        feedback: 'A life requirement. You get first bite, I get the rest.',
      },
      {
        label: 'Living softly, laughing loudly, and loving deeply.',
        feedback: 'The dream. And we are going to build every bit of it.',
      },
      {
        label: 'All of the above, forever and unconditionally.',
        feedback: 'PERFECT SCORE! You hold my heart forever.',
        isExtraCute: true,
      },
    ],
  },
]

export function CoupleLoreQuiz() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQ = QUESTIONS[currentIndex]

  const handleSelect = (index: number) => {
    if (selectedOption !== null) return
    setSelectedOption(index)
    const opt = currentQ.options[index]
    setFeedback(opt.feedback)

    buzz(20)
    if (opt.isExtraCute) {
      playSparkle()
      wishBurst()
    } else {
      playClick()
    }
  }

  const handleNext = () => {
    setSelectedOption(null)
    setFeedback(null)

    if (currentIndex + 1 < QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1)
      playClick()
    } else {
      setIsCompleted(true)
      playChime()
      midnightBurst()
    }
  }

  const restartQuiz = () => {
    playClick()
    setCurrentIndex(0)
    setSelectedOption(null)
    setFeedback(null)
    setIsCompleted(false)
  }

  return (
    <section className="relative mx-auto w-full max-w-lg px-5 py-14">
      <SectionHeading
        index="08"
        eyebrow="relationship trivia"
        title="The Lore of Us."
        sub="A quick 5-question couple test. Let’s see how well you know the rules of our universe."
      />

      <div className="mt-8 rounded-3xl border border-white/15 bg-charcoal/80 p-6 shadow-2xl backdrop-blur-md">
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              {/* Question Header & Progress */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="mono-label text-rose/80">
                  Question {currentIndex + 1} of {QUESTIONS.length}
                </span>
                <div className="flex gap-1.5">
                  {QUESTIONS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-6 rounded-full transition-all ${
                        i === currentIndex
                          ? 'bg-rose w-8'
                          : i < currentIndex
                          ? 'bg-rose/40'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <h3 className="mt-4 font-display text-[17px] font-semibold text-white/95">
                {currentQ.prompt}
              </h3>

              {/* Options */}
              <div className="mt-5 space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const isChosen = selectedOption === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={selectedOption !== null}
                      className={`w-full text-left rounded-2xl p-3.5 text-[13.5px] leading-snug transition-all cursor-pointer ${
                        isChosen
                          ? 'border border-rose bg-rose/20 text-white font-medium shadow-md shadow-rose/20'
                          : selectedOption !== null
                          ? 'border border-white/5 bg-white/[0.02] text-white/40'
                          : 'border border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-mono text-white/70">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Instant Feedback Callout */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-2xl border border-rose/30 bg-rose/10 p-3.5 text-[13px] text-white/90"
                  >
                    <p className="flex items-center gap-1.5 font-semibold text-rose mb-1">
                      <Sparkles size={14} />
                      Verdict:
                    </p>
                    <p className="italic">"{feedback}"</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Button */}
              {selectedOption !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex justify-end"
                >
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 rounded-full bg-rose px-5 py-2 font-display text-[13px] font-semibold text-black shadow-lg shadow-rose/25 hover:bg-white transition-all cursor-pointer"
                  >
                    <span>
                      {currentIndex + 1 === QUESTIONS.length ? 'See Final Score' : 'Next Question'}
                    </span>
                    <span>→</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Quiz Completed Award Screen */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-4"
            >
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-gold/15 shadow-[0_0_40px_rgba(255,201,60,0.3)]">
                <Award size={42} className="text-gold" />
                <Sparkles size={18} className="absolute -top-1 -right-1 text-gold animate-bounce" />
              </div>

              <span className="mono-label mt-5 block text-gold tracking-widest uppercase">
                Official Certification
              </span>

              <h3 className="mt-2 font-display text-2xl font-bold text-white">
                100% Girlfriend Score
              </h3>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left space-y-2">
                <p className="text-[13px] text-white/80">
                  <span className="text-white/40">Conferred upon:</span>{' '}
                  <strong className="text-rose font-semibold">{PEOPLE.recipient.name}</strong>
                </p>
                <p className="text-[13px] text-white/80">
                  <span className="text-white/40">Title:</span>{' '}
                  <strong>Love of My Life & Best Human in the Known Universe</strong>
                </p>
                <p className="text-[13px] text-white/80">
                  <span className="text-white/40">Validity:</span>{' '}
                  <strong className="text-gold">Lifetime + Infinite Renewal</strong>
                </p>
              </div>

              <p className="mt-5 text-[13.5px] leading-relaxed text-white/70 italic">
                "You passed with flying colors. Even if you picked every wrong option, you would still be the best thing that ever happened to me."
              </p>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={restartQuiz}
                  className="flex items-center gap-1.5 text-[12.5px] text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Play again</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
