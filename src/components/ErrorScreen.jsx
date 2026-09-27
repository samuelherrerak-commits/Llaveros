import { motion } from 'framer-motion'
import { blurIn, spring, stagger } from '../lib/motion.js'

const COPY = {
  NOT_FOUND: {
    title: 'Este llavero aún no tiene mensaje',
    body: 'Puede que todavía se esté preparando. Vuelve a acercarlo en un rato.',
  },
  UNAUTHORIZED: {
    title: 'No pudimos verificar este llavero',
    body: 'El portal no está autorizado para leer los mensajes. Avísanos para revisarlo.',
  },
  MISSING_SLUG: {
    title: 'Enlace incompleto',
    body: 'Parece que el enlace del llavero no está bien grabado.',
  },
  default: {
    title: 'No pudimos abrir tu mensaje',
    body: 'Revisa tu conexión a internet e inténtalo de nuevo.',
  },
}

export default function ErrorScreen({ error }) {
  const copy = COPY[error?.code] ?? COPY.default
  const canRetry = !['NOT_FOUND', 'MISSING_SLUG', 'UNAUTHORIZED'].includes(error?.code)

  return (
    <motion.main
      key="error"
      className="screen-dvh safe-px fixed inset-0 grid place-items-center overflow-hidden bg-neutral-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="pointer-events-none absolute -top-32 left-1/2 size-96 -translate-x-1/2 rounded-full bg-rose-500/20 blur-3xl" />

      <motion.div
        className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl"
        variants={stagger(0.08, 0.1)}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={blurIn} className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl bg-white/5 text-2xl">
          🔑
        </motion.div>
        <motion.h1 variants={blurIn} className="font-serif text-2xl leading-tight text-white">
          {copy.title}
        </motion.h1>
        <motion.p variants={blurIn} className="mt-3 text-sm leading-relaxed text-white/55">
          {copy.body}
        </motion.p>
        {canRetry && (
          <motion.button
            variants={blurIn}
            whileTap={{ scale: 0.96 }}
            transition={spring.snappy}
            onClick={() => window.location.reload()}
            className="mt-7 h-12 w-full rounded-full bg-white text-sm font-semibold text-neutral-950"
          >
            Reintentar
          </motion.button>
        )}
      </motion.div>
    </motion.main>
  )
}
