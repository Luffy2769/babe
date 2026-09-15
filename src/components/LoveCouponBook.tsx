import { Check, Copy, ExternalLink } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { buzz, wishBurst } from '../lib/celebrate'
import { playChime, playClick, playScratch } from '../lib/sfx'
import { SectionHeading } from './ui/SectionHeading'

interface Coupon {
  id: string
  title: string
  tag: string
  description: string
  finePrint: string
  code: string
  bgGradient: string
  foilColor: string
}

const COUPONS: Coupon[] = [
  {
    id: 'food',
    title: 'Emergency Food Delivery',
    tag: 'Midnight Cravings',
    description: 'Craving something right now? Tell me what you want, and it will be ordered and delivered to your doorstep in Sampit. Paid in full by me.',
    finePrint: 'Valid 24/7. No justification required. Desserts encouraged.',
    code: 'BABE-FEAST-01',
    bgGradient: 'from-rose/25 via-charcoal to-blood/20',
    foilColor: '#b02a45',
  },
  {
    id: 'debate',
    title: 'Win Any Argument Card',
    tag: 'Total Immunity',
    description: 'Play this card during any minor debate or disagreement. You automatically win on the spot, and I have to agree you were right all along.',
    finePrint: 'One-time use (or infinite if you look at me with puppy eyes).',
    code: 'ALWAYS-RIGHT-99',
    bgGradient: 'from-gold/20 via-charcoal to-ember/25',
    foilColor: '#c2932b',
  },
  {
    id: 'movie',
    title: 'Movie Night Dictator',
    tag: 'Remote Date',
    description: 'You pick the movie, Kdrama, or series. I will stream it with you, hold your virtual hand, and not complain or make fun of the plot even once.',
    finePrint: 'Popcorn and snacks highly recommended.',
    code: 'STREAM-WITH-YOU',
    bgGradient: 'from-purple-500/20 via-charcoal to-rose/25',
    foilColor: '#7c3aed',
  },
  {
    id: 'pamper',
    title: 'Full Pamper & Royal Treatment',
    tag: 'In-Person Reunion',
    description: 'When we meet: A complete full-day pampering session. Head scratches, back massage, your favorite food, zero chores, and 100% undivided attention.',
    finePrint: 'Guaranteed upon reunion. Never expires.',
    code: 'VIP-REUNION-DAY',
    bgGradient: 'from-emerald-500/20 via-charcoal to-teal/25',
    foilColor: '#059669',
  },
  {
    id: 'sleep',
    title: 'Voice Note on Demand Pass',
    tag: 'Personal Audio',
    description: 'Feeling lonely, having a hard day, or just want to hear me speak? Redeem for a dedicated voice note recorded exclusively for you right away.',
    finePrint: 'Recorded with love, zero rush, yours to keep forever.',
    code: 'VOICE-NOTE-NOW',
    bgGradient: 'from-blue-500/20 via-charcoal to-indigo/25',
    foilColor: '#2563eb',
  },
  {
    id: 'spontaneous',
    title: 'Spontaneous Sweet Treat',
    tag: 'Just Because',
    description: 'Redeem for an instant coffee, boba, or sweet treat of your choice sent to you on any random boring day.',
    finePrint: 'Can be redeemed on any day ending in "y".',
    code: 'SWEET-TOOTH-100',
    bgGradient: 'from-pink-500/20 via-charcoal to-rose/25',
    foilColor: '#db2777',
  },
]

function ScratchCard({
  coupon,
  isScratched,
  onScratched,
}: {
  coupon: Coupon
  isScratched: boolean
  onScratched: (id: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawingRef = useRef(false)
  const [percent, setPercent] = useState(isScratched ? 100 : 0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isScratched) {
      setPercent(100)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw luxury metallic foil
    const width = canvas.width
    const height = canvas.height

    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, '#2d2d38')
    grad.addColorStop(0.3, '#4a4a5a')
    grad.addColorStop(0.5, '#6e6e85')
    grad.addColorStop(0.7, '#3a3a4a')
    grad.addColorStop(1, '#1e1e26')

    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // Add foil sparkle specks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
    for (let i = 0; i < 60; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2)
    }

    // Centered foil prompt
    ctx.font = '600 13px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.textAlign = 'center'
    ctx.fillText('✨ SCRATCH WITH FINGER / MOUSE ✨', width / 2, height / 2)
  }, [isScratched])

  const scratch = (clientX: number, clientY: number) => {
    if (percent >= 50) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = (clientX - rect.left) * (canvas.width / rect.width)
    const y = (clientY - rect.top) * (canvas.height / rect.height)

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 24, 0, Math.PI * 2)
    ctx.fill()

    playScratch()
    buzz(10)

    // Calculate percentage scratched every few scratches
    if (Math.random() > 0.4) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imgData.data
      let transparent = 0
      for (let i = 3; i < data.length; i += 16) {
        if (data[i] === 0) transparent++
      }
      const currentPct = Math.round((transparent / (data.length / 16)) * 100)
      setPercent(currentPct)

      if (currentPct >= 42) {
        setPercent(100)
        onScratched(coupon.id)
        playChime()
        wishBurst()
        buzz([100, 50, 150])
      }
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawingRef.current = true
    scratch(e.clientX, e.clientY)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current) return
    scratch(e.clientX, e.clientY)
  }

  const handlePointerUp = () => {
    isDrawingRef.current = false
  }

  const claimWhatsApp = () => {
    playClick()
    const message = encodeURIComponent(
      `Hey handsome ❤️ I just scratched off and redeemed my coupon: "${coupon.title}" (Code: ${coupon.code})! What time are you getting on this? 🥰`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const copyCode = () => {
    playClick()
    navigator.clipboard?.writeText(
      `Claimed Coupon: ${coupon.title} (${coupon.code}) - ${coupon.description}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br ${coupon.bgGradient} p-5 shadow-xl transition-all`}
    >
      {/* Underlying Coupon Details */}
      <div className="flex flex-col justify-between h-full min-h-[200px]">
        <div>
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-rose">
              {coupon.tag}
            </span>
            <span className="mono-label text-white/40">{coupon.code}</span>
          </div>

          <h3 className="mt-3 font-display text-lg font-bold text-white/95">
            {coupon.title}
          </h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-white/75">
            {coupon.description}
          </p>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3 flex items-center justify-between">
          <p className="text-[11px] text-white/40 italic">{coupon.finePrint}</p>

          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11.5px] text-white/80 hover:bg-white/20 transition-all cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={claimWhatsApp}
              className="flex items-center gap-1 rounded-full bg-rose/25 border border-rose/40 px-3 py-1 text-[11.5px] font-medium text-rose hover:bg-rose hover:text-black transition-all cursor-pointer"
            >
              <span>Redeem</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Foil Scratch Layer */}
      {percent < 100 && (
        <canvas
          ref={canvasRef}
          width={360}
          height={210}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="absolute inset-0 h-full w-full touch-none cursor-pointer rounded-3xl"
        />
      )}
    </div>
  )
}

export function LoveCouponBook() {
  const [scratchedIds, setScratchedIds] = useLocalStorage<string[]>('bp.scratched_coupons', [])
  const [filter, setFilter] = useState<'all' | 'unscratched' | 'unlocked'>('all')

  const handleScratched = (id: string) => {
    setScratchedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const displayedCoupons = COUPONS.filter((c) => {
    if (filter === 'unscratched') return !scratchedIds.includes(c.id)
    if (filter === 'unlocked') return scratchedIds.includes(c.id)
    return true
  })

  return (
    <section className="relative mx-auto w-full max-w-lg px-5 py-14">
      <SectionHeading
        index="06"
        eyebrow="redeemable anytime"
        title="Love Coupon Book."
        sub="Scratch off the silver foil to reveal your birthday vouchers. Redeemable with no expiration date."
      />

      {/* Filter Tabs */}
      <div className="mt-5 flex gap-2">
        <button
          onClick={() => {
            playClick()
            setFilter('all')
          }}
          className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all ${
            filter === 'all'
              ? 'bg-rose text-black font-semibold'
              : 'bg-white/5 text-white/60 border border-white/10 hover:text-white'
          }`}
        >
          All ({COUPONS.length})
        </button>
        <button
          onClick={() => {
            playClick()
            setFilter('unscratched')
          }}
          className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all ${
            filter === 'unscratched'
              ? 'bg-rose text-black font-semibold'
              : 'bg-white/5 text-white/60 border border-white/10 hover:text-white'
          }`}
        >
          To Scratch ({COUPONS.length - scratchedIds.length})
        </button>
        <button
          onClick={() => {
            playClick()
            setFilter('unlocked')
          }}
          className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all ${
            filter === 'unlocked'
              ? 'bg-rose text-black font-semibold'
              : 'bg-white/5 text-white/60 border border-white/10 hover:text-white'
          }`}
        >
          Unlocked ({scratchedIds.length})
        </button>
      </div>

      {/* Coupons Stack */}
      <div className="mt-6 space-y-4">
        {displayedCoupons.map((coupon) => (
          <ScratchCard
            key={coupon.id}
            coupon={coupon}
            isScratched={scratchedIds.includes(coupon.id)}
            onScratched={handleScratched}
          />
        ))}
      </div>
    </section>
  )
}
