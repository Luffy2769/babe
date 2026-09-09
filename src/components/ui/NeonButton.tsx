import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = {
  children: ReactNode
  icon?: ReactNode
  variant?: 'solid' | 'ghost'
  full?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

/** The one button style in the app. 44px+ tall everywhere for thumbs. */
export function NeonButton({
  children,
  icon,
  variant = 'solid',
  full,
  className = '',
  ...rest
}: Props) {
  const base =
    'group relative inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full px-6 py-3 font-mono text-[12px] font-bold tracking-[0.2em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40'

  const skin =
    variant === 'solid'
      ? 'text-white bg-crimson/15 border border-crimson/50 hover:bg-crimson/25 neon-edge'
      : 'text-white/70 border border-white/15 bg-white/5 backdrop-blur-md hover:text-white hover:border-white/30'

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className={`${base} ${skin} ${full ? 'w-full' : ''} ${className}`}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {icon}
      <span className="relative top-px">{children}</span>
    </motion.button>
  )
}
