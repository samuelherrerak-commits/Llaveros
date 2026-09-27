import { motion } from 'framer-motion'
import { ease } from '../lib/motion.js'

export default function LoadingScreen() {
  return (
    <motion.div
      key="loading"
      className="screen-dvh fixed inset-0 grid place-items-center bg-neutral-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(12px)', transition: { duration: 0.45, ease: ease.outExpo } }}
      role="status"
      aria-live="polite"
    >
      <div className="relative grid place-items-center">
        {/* Halo que respira */}
        <motion.div
          className="absolute size-28 rounded-full bg-rose-500/30 blur-2xl"
          animate={{ scale: [0.8, 1.15, 0.8], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.svg
          viewBox="0 0 24 24"
          className="relative size-10 fill-rose-400"
          animate={{ scale: [1, 1.18, 1, 1.12, 1] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut', times: [0, 0.15, 0.3, 0.45, 1] }}
        >
          <path d="M12 21s-8.5-5.1-8.5-11.2A4.8 4.8 0 0 1 12 6.9a4.8 4.8 0 0 1 8.5 2.9C20.5 15.9 12 21 12 21z" />
        </motion.svg>
        <motion.p
          className="absolute top-16 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.35em] text-white/40"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: ease.outExpo }}
        >
          Abriendo tu mensaje
        </motion.p>
      </div>
    </motion.div>
  )
}
