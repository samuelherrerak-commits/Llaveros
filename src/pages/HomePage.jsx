import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { KEYCHAINS } from '../data/keychains.js'
import { TEMPLATES } from '../templates/index.js'
import { blurIn, spring, stagger } from '../lib/motion.js'

// La lista de demo solo aparece en desarrollo (o si se fuerza con VITE_SHOW_DEMO=true)
// para no exponer los mensajes de los clientes en la portada pública.
const SHOW_DEMO = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO === 'true'

/** Pantalla neutra para quien entra al dominio sin slug. */
export default function HomePage() {
  return (
    <main className="screen-dvh safe-px safe-pt safe-pb relative flex flex-col items-center justify-center overflow-hidden bg-neutral-950 text-center">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-rose-500/20 blur-[100px]" />

      <motion.div className="relative w-full max-w-sm" variants={stagger(0.08, 0.1)} initial="hidden" animate="show">
        <motion.div variants={blurIn} className="relative mx-auto mb-10 grid size-24 place-items-center">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute inset-0 rounded-full border border-rose-300/40"
              animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
              transition={{ duration: 2.4, delay: i * 0.8, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}
          <span className="relative grid size-16 place-items-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <svg viewBox="0 0 24 24" className="size-7 fill-rose-400">
              <path d="M12 21s-8.5-5.1-8.5-11.2A4.8 4.8 0 0 1 12 6.9a4.8 4.8 0 0 1 8.5 2.9C20.5 15.9 12 21 12 21z" />
            </svg>
          </span>
        </motion.div>

        <motion.h1 variants={blurIn} className="font-serif text-3xl leading-tight text-white">
          Acerca tu teléfono al llavero
        </motion.h1>
        <motion.p variants={blurIn} className="mx-auto mt-3 max-w-[18rem] text-sm leading-relaxed text-white/50">
          Cada llavero guarda un mensaje hecho a mano para una sola persona.
        </motion.p>

        {SHOW_DEMO && (
          <motion.nav variants={blurIn} className="mt-10 grid gap-2 text-left">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.3em] text-white/30">Demo · plantillas</p>
            {Object.entries(KEYCHAINS).map(([slug, k]) => (
              <motion.div key={slug} whileTap={{ scale: 0.97 }} transition={spring.snappy}>
                <Link
                  to={`/id/${slug}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 backdrop-blur-md"
                >
                  <span>
                    <span className="block text-sm font-medium text-white">{TEMPLATES[k.template_id].name}</span>
                    <span className="block text-xs text-white/40">/id/{slug}</span>
                  </span>
                  <span className="text-white/30">→</span>
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </motion.div>
    </main>
  )
}
