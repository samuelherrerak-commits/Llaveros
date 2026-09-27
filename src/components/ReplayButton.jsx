import { motion } from 'framer-motion'
import { spring } from '../lib/motion.js'

/** Botón circular discreto para volver a ver la animación. */
export default function ReplayButton({ onClick, className = '', delay = 0, label = 'Ver de nuevo' }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.88 }}
      transition={{ ...spring.snappy, delay }}
      className={`grid size-11 place-items-center rounded-full backdrop-blur-md ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
      </svg>
    </motion.button>
  )
}
