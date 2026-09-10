import { motion } from 'framer-motion'
import { Activity, Cpu, Heart, Lock, ShieldCheck, Sparkles, Terminal, Wifi } from 'lucide-react'
import { useState } from 'react'
import { DISTANCE_KM, PEOPLE } from '../config'
import { playClick, playSparkle } from '../lib/sfx'
import { Modal } from './ui/Modal'
import { NeonButton } from './ui/NeonButton'

interface SecretTelemetryModalProps {
  open: boolean
  onClose: () => void
}

export function SecretTelemetryModal({ open, onClose }: SecretTelemetryModalProps) {
  const [decrypted, setDecrypted] = useState(false)

  const handleDecrypt = () => {
    playSparkle()
    setDecrypted(true)
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        playClick()
        onClose()
      }}
      title="Classified Telemetry // 16.09"
    >
      <div className="space-y-5 font-mono text-[13px]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-crimson">
            <Terminal size={16} />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase">
              NODE_DIAGNOSTICS_V2.4
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
            LINK SECURE
          </span>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] tracking-widest text-white/40 uppercase">
              <Wifi size={12} className="text-crimson" />
              Quantum Carrier
            </div>
            <p className="mt-1 font-display text-sm font-semibold text-white">
              ULP / Heart-Sync
            </p>
            <p className="text-[9px] text-white/35">Unconditional Love Protocol</p>
          </div>

          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] tracking-widest text-white/40 uppercase">
              <ShieldCheck size={12} className="text-gold" />
              Packet Loss
            </div>
            <p className="mt-1 font-display text-sm font-semibold text-emerald-400">
              0.0000%
            </p>
            <p className="text-[9px] text-white/35">Zero thoughts dropped</p>
          </div>

          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] tracking-widest text-white/40 uppercase">
              <Activity size={12} className="text-blood" />
              Ocean Span
            </div>
            <p className="mt-1 font-display text-sm font-semibold text-white">
              {DISTANCE_KM.toLocaleString()} KM
            </p>
            <p className="text-[9px] text-white/35">Zero distance in spirit</p>
          </div>

          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-[10px] tracking-widest text-white/40 uppercase">
              <Cpu size={12} className="text-crimson" />
              Heart Buffer
            </div>
            <p className="mt-1 font-display text-sm font-semibold text-crimson">
              OVERFLOW: ∞
            </p>
            <p className="text-[9px] text-white/35">Capacity exceeded daily</p>
          </div>
        </div>

        {/* Origin / Destination HUD Table */}
        <div className="glass rounded-xl p-3.5 space-y-2">
          <p className="hud-label text-[9px]">Transceiver Nodes</p>
          <div className="flex items-center justify-between text-[11px] text-white/80">
            <span>{PEOPLE.sender.city} ({PEOPLE.sender.zoneLabel})</span>
            <span className="text-crimson">──────▶</span>
            <span>{PEOPLE.recipient.city} ({PEOPLE.recipient.zoneLabel})</span>
          </div>
          <p className="text-[10px] text-white/40">
            Relative Clock: You are exactly 1 hour 30 mins ahead in tomorrow.
          </p>
        </div>

        {/* Encrypted Secret Message Drawer */}
        <div className="relative overflow-hidden rounded-xl border border-crimson/30 bg-crimson/5 p-4">
          <div className="flex items-center justify-between">
            <p className="hud-label text-[10px] text-crimson">
              {decrypted ? 'DECRYPTED TRANSMISSION' : 'ENCRYPTED MEMORY CIPHER'}
            </p>
            {decrypted ? (
              <Heart size={14} className="text-crimson" fill="currentColor" />
            ) : (
              <Lock size={14} className="text-white/40" />
            )}
          </div>

          {decrypted ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 space-y-2 font-display text-[14px] leading-relaxed text-white/90"
            >
              <p className="italic">
                "If distance is just geometry, then loving you is proof that physics has no jurisdiction over how close you feel every single day."
              </p>
              <p className="font-mono text-[10px] tracking-wider text-crimson">
                // AUTHENTICATED: FOREVER YOURS
              </p>
            </motion.div>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="font-mono text-[11px] text-white/40 tracking-widest break-all">
                7F4A 9B2C D10E 448F B209 1609 2026 LOVE_LINK_VERIFIED
              </p>
              <NeonButton
                variant="ghost"
                onClick={handleDecrypt}
                icon={<Sparkles size={12} />}
              >
                Decrypt Secret Note
              </NeonButton>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={() => {
              playClick()
              onClose()
            }}
            className="cursor-pointer rounded-lg px-4 py-2 text-[11px] tracking-wider text-white/50 transition-colors hover:text-white"
          >
            [ CLOSE TELEMETRY ]
          </button>
        </div>
      </div>
    </Modal>
  )
}
